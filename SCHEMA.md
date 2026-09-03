# 데이터 스키마 — RED DEVILS HUB

세 개의 전역 객체를 각 파일이 정의하고, `index.html`·`club.html`이 `<script src>`로 읽는다. 빌드 없음.

| 파일 | 전역 | 누가 쓰나 | 갱신 주기 |
|---|---|---|---|
| `data.js` | `window.HUB` | `scripts/update-data.mjs` (BBC Sport 파싱, 파일 전체를 덮어씀) | 매일 |
| `briefings.js` | `window.HUB_BRIEFINGS` | 브리핑 루틴 (`ROUTINE.md`) — 맨 앞에 항목 추가 | 브리핑 생성 시 |
| `clubs.js` | `window.HUB_CLUBS` | 사람이 작성 (정적) | 시즌 초 · 필요 시 |

팀 키(`key`)는 BBC의 팀 슬러그를 그대로 쓴다. 2026-27 시즌 20팀:
`arsenal` `aston-villa` `afc-bournemouth` `brentford` `brighton-and-hove-albion` `chelsea` `coventry-city` `crystal-palace` `everton` `fulham` `hull-city` `ipswich-town` `leeds-united` `liverpool` `manchester-city` `manchester-united` `newcastle-united` `nottingham-forest` `sunderland` `tottenham-hotspur`

응원팀 키: `manchester-united` (`HUB.meta.team`).

---

## 1. `data.js` → `window.HUB`

```js
window.HUB = {
  meta: {
    updatedAt: "2026-09-03T09:00:00+09:00",   // 스크립트 실행 시각 (KST ISO)
    season: "2026-27",
    seasonStart: "2026-08-01", seasonEnd: "2027-05-31", // 스크립트가 훑는 범위
    team: "manchester-united",
    matchweeks: 38,
    source: "BBC Sport",
    currentMw: 3          // 아직 결과가 안 난 PL 경기 중 가장 이른 매치위크 (시즌 종료 후엔 38)
  },

  // 20팀 기본 정보 (BBC 순위표에서 추출). 배지는 BBC 정적 SVG 핫링크.
  teams: {
    "manchester-united": { name: "Manchester United", short: "Man Utd",
      badge: "https://static.files.bbci.co.uk/core/website/assets/static/sport/football/manchester-united.80807495b5.svg" },
    // ... 20팀
  },

  // 경기 — PL 380경기 전체 + 맨유가 뛰는 다른 대회 경기. 날짜순 오름차순.
  fixtures: [
    {
      id: "s-456r7l56tjgjsbqaqmgdm9zis",   // BBC 이벤트 id
      comp: "PL",                          // "PL" | "UCL" | "UEL" | "UECL" | "FAC" | "EFL" | "FR"(친선) | "OTHER"
      compName: "Premier League",          // BBC 대회명 원문
      round: null,                         // 컵·유럽대항전 라운드 원문 ("League Stage", "3rd Round" …). PL이면 null
      mw: 3,                               // PL만. 스크립트가 도출한 매치위크 1~38. 그 외 대회는 null
      kickoff: "2026-09-06T13:00:00Z",     // UTC ISO. 화면은 브라우저 로컬(KST)로 변환해 표시
      dateUK: "2026-09-06", timeUK: "14:00",
      home: { key: "everton", name: "Everton", short: "Everton" },   // key는 PL 팀이면 슬러그, 그 외(컵 상대)는 BBC 슬러그 그대로 (teams/clubs에 없을 수 있음)
      away: { key: "manchester-united", name: "Manchester United", short: "Man Utd" },
      status: "pre",                       // "pre" | "live" | "post" | "postponed"
      statusText: "Scheduled",             // BBC 상태 문구 ("FT", "HT", "Postponed", "Scheduled" …)
      score: null,                         // 경기 후·진행 중: { home: 2, away: 1 }
      winner: null,                        // "home" | "away" | "draw" | null
      scorers: { home: [], away: [] },     // [{ name: "B. Saka", times: ["59'"] }] — BBC가 준 경우만
      mu: true,                            // 맨유 경기 여부
      url: "https://www.bbc.com/sport/football/live/c6vgy8x2z08et"   // BBC 경기 페이지 (없으면 null)
    }
  ],

  // 리그 순위표 — rank 오름차순 20개
  standings: [
    { rank: 1, key: "manchester-city", name: "Manchester City", short: "Man City",
      played: 2, won: 2, drawn: 0, lost: 0, gf: 6, ga: 2, gd: 4, points: 6,
      form: ["-","-","-","-","W","W"],     // 최근 6경기, 오래된 것부터. 값: "W" | "D" | "L" | "-"
      zone: "UEFA Champions League",       // BBC rankStatus 원문: "UEFA Champions League" | "UEFA Europa League" | "UEFA Conference League" | "Relegation" | ""
      rankPrev: 8 }
  ],

  // 득점 순위 — BBC top scorers (득점 순). 어시스트 순위는 이 배열을 assists로 정렬해 표시
  scorers: [
    { rank: 1, name: "Bruno Fernandes", team: "manchester-united", teamShort: "Man Utd",
      goals: 3, assists: 1, played: 2, minutes: 180, shots: 11 }
  ]
};
```

파생 규칙 (화면 쪽에서 계산):
- 맨유 다음 경기 = `fixtures.filter(f => f.mu && f.status !== "post")` 중 kickoff가 가장 이른 것 (연기 경기는 kickoff 미정이면 제외).
- 맨유 최근 경기 = `f.mu && f.status === "post"` 를 kickoff 내림차순 5개.
- 매치위크 스코어보드 = `comp === "PL" && mw === meta.currentMw` 10경기.
- 시즌 진행 = PL 380경기 중 `status === "post"` 비율, 매치위크 단위 표시.

## 2. `briefings.js` → `window.HUB_BRIEFINGS`

```js
window.HUB_BRIEFINGS = [
  // 최신이 맨 앞. 루틴이 unshift 한다.
  { date: "2026-09-04", file: "briefings/epl-news-2026-09-04.html",
    count: 18,        // 기사 수
    mu: 6,            // 그중 맨유 카테고리 기사 수
    headline: "아모림, 에버턴전 앞두고 로테이션 시사 · 이적시장 마감 정리 · PSR 개정안 통과" }
];
```

## 3. `clubs.js` → `window.HUB_CLUBS`

```js
window.HUB_CLUBS = {
  "manchester-united": {
    name: "Manchester United", short: "Man Utd", ko: "맨체스터 유나이티드", abbr: "MUN",
    nick: "레드 데블스", founded: 1878, city: "맨체스터",
    color: "#DA291C", color2: "#FBE122",          // 메인·보조 색 (배지 기반)
    stadium: { name: "Old Trafford", ko: "올드 트래퍼드", capacity: 74197, opened: 1910,
      photo: { url: "https://upload.wikimedia.org/…jpg", credit: "작성자명", license: "CC BY-SA 4.0",
               source: "https://commons.wikimedia.org/wiki/File:…" } },   // 커먼즈에 적합한 사진이 없으면 photo: null
    manager: { name: "Ruben Amorim", ko: "후벵 아모림", since: 2024 },
    keyPlayers: [ { name: "Bruno Fernandes", ko: "브루누 페르난데스", pos: "MF" } ],   // 3~5명
    intro: "구단 소개 2~3문장(한국어).",
    history: [ { y: 1999, t: "트레블", d: "한 문단 설명" } ],        // 3~5개, 연도순
    rivalry: "맨유와의 관계·라이벌리·기억할 만한 맞대결 한 문단(한국어). 맨유 자신은 정체성 설명.",
    watch: [ "이번 시즌 관전 포인트 1", "포인트 2", "포인트 3" ]      // 2026-27 시즌 기준
  },
  // ... 20팀
};
```

- `clubs.js`의 감독·핵심 선수는 **2026-27 시즌 개막 기준**이며 시즌 중 변동은 손으로 갱신한다(스크립트는 손대지 않음).
- 화면은 팀 이름·배지는 `HUB.teams`, 한국어명·색·구장·소개는 `HUB_CLUBS`에서 가져온다. 둘 중 하나가 없어도 깨지지 않게 폴백(영문명, 회색)한다.
