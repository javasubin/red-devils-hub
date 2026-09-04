# RED DEVILS HUB 데일리 루틴 — 팀별 EPL 브리핑 생성 + 허브 갱신 + 커밋

프리미어리그 소식을 매일 한국어 브리핑으로 만들어 저장소에 쌓는다.
**한 번 돌리면 지원 팀 수만큼 파일이 나온다** (지금은 맨유·토트넘 → 2개).
**이 문서만 보고 처음부터 끝까지 수행한다.** 저장소 루트(`C:\red-devils-hub`)에서 작업한다.

> 수집은 한 번, 파일은 N개. 리그 전체 소식은 한 번만 모아 **모든 팀 파일에 똑같이** 넣고,
> 맨 위 팀 섹션만 팀마다 따로 모은다.
> 스포일러 차단 장치는 없다. 경기 결과·순위·득점자를 그대로 쓴다.
> 손대지 않는 파일: `index.html`, `club.html`, `clubs.js`, `scripts/update-data.mjs`.
> `data.js`는 0단계 스크립트가 통째로 다시 쓰므로 손으로 편집하지 않는다.

---

## 0. 날짜·데이터·지원 팀 확인

> 도구 주의: Bash의 `/tmp`는 Node에서 `C:\tmp`로 해석된다. 임시 파일은 저장소 밖 절대 경로(예: 세션 scratchpad)를 쓰고, `/tmp`에 쓴 파일을 Node로 읽지 않는다.

### 0-A. 오늘 날짜 (KST)
Bash 도구로 한 번에 뽑는다. 기계 시간대와 무관하게 서울 기준이다.

```bash
node -e "const d=new Date(),z={timeZone:'Asia/Seoul'};const iso=new Intl.DateTimeFormat('sv-SE',z).format(d);console.log('ISO  '+iso);console.log('DOT  '+iso.replace(/-/g,'.'));console.log('KO   '+new Intl.DateTimeFormat('ko-KR',{...z,dateStyle:'full'}).format(d))"
```

- `ISO` → 파일명 `briefings/epl-news-<ISO>-<팀키>.html`, `briefings.js`의 `date`
- `DOT` → `{{DATE_DOT}}` (`<title>`, 푸터)
- `KO` → `{{DATE_KO}}` (헤더 kicker)

### 0-B. 경기·순위 데이터 갱신
```bash
node scripts/update-data.mjs
```
BBC Sport를 파싱해 `data.js` 전체를 다시 쓴다. Claude가 내용을 만들지 않는다.
Node가 없거나 스크립트가 실패하면 **에러 원문을 보고에 남기고 브리핑 작업은 그대로 진행한다.**

### 0-C. 지원 팀 확인
지원 팀 목록의 진실원본은 `data.js`의 `HUB.meta.teams`다. **첫 번째가 기본 팀**(`HUB.meta.team` = `manchester-united`).
팀 키·한국어명·영문명·색을 한 번에 뽑는다.

```bash
node -e "global.window={};require('./data.js');require('./clubs.js');const H=window.HUB,C=window.HUB_CLUBS;for(const t of H.meta.teams){const c=C[t]||{};console.log([t,c.ko||'?',c.name||'?',c.color||'#DA291C'].join(' | '))}"
```

배지 이모지와 짧은 이름은 코드에 없다. 아래 표에서 가져온다. **지원 팀을 늘리면 이 표와 1-B 매체 표에 한 줄씩 추가한다.**

| 팀 키 (`{{TEAM_KEY}}`) | 배지 `{{TEAM_BADGE}}` | 짧은 이름 `{{TEAM_SHORT_KO}}` | 한국어명 `{{TEAM_NAME_KO}}` | 색 (`{{PH_COLOR}}` 기본값) |
|---|---|---|---|---|
| `manchester-united` — 기본, 항상 첫 번째 | 🔴 | 맨유 | 맨체스터 유나이티드 | `#DA291C` |
| `tottenham-hotspur` | ⚪ | 토트넘 | 토트넘 홋스퍼 | `#132257` |

### 0-D. 팀별 다음 경기
`{{NEXT_LINE}}`·`{{DIGEST_3}}`와 팀별 프리뷰 검색 쿼리에 쓴다. `fav` 배열이 그 팀이 뛰는 경기(컵·유럽대항전 포함)를 가리킨다.

```bash
node -e "global.window={};require('./data.js');const H=window.HUB;for(const t of H.meta.teams){const f=H.fixtures.filter(x=>(x.fav||[]).includes(t)&&x.status!=='post'&&x.kickoff).sort((a,b)=>a.kickoff<b.kickoff?-1:1)[0];console.log(t,f?JSON.stringify({comp:f.comp,kickoff:f.kickoff,home:f.home.name,away:f.away.name}):'없음')}"
```

---

## 1. 기사 수집 — 2단계 필수

### 1-A. 무엇을 얼마나 모으나

- **리그 공통 — 한 번만 모은다.** 매치위크·이적·계약·선수·감독·규정·VAR·PSR·기타. 이 카드들은 그날 만드는 **모든 팀 파일에 그대로 복사**해 넣는다. 팀마다 다시 모으지 않는다.
- **팀별 — 팀마다 모은다.** 그 팀이 주제인 기사 **5건 이상**.
- **지원 팀이 주제인 기사는 리그 공통에 넣지 않는다.** 맨유 기사는 맨유 파일에만, 토트넘 기사는 토트넘 파일에만 들어간다. 그래야 리그 공통 묶음이 팀과 무관해지고, 한 파일 안에서 같은 기사가 두 섹션에 겹치지 않는다.
- 두 지원 팀이 맞붙는 경기 기사는 **양쪽 파일의 팀 섹션에 모두** 넣는다.
- 한 파일의 카드는 **최대 25건**(팀 5건 이상 + 리그 공통).

### 1-B. 검색 (WebSearch)

공통 매체(모든 팀 파일에 쓴다): **BBC Sport, Sky Sports, The Guardian, The Independent, ESPN**.

팀별 매체:

| 팀 | 매체 | 비고 |
|---|---|---|
| 맨유 | Manchester Evening News | 맨유 전담. 검색으로 잡힌 기사 URL을 그대로 연다 |
| 맨유 | manutd.com (공식) | **검색에 개별 기사 URL이 잡힐 때만.** 뉴스 목록을 클라이언트에서 렌더링해 curl로는 링크가 안 나온다 |
| 토트넘 | football.london (Spurs 담당 기자) | 토트넘 전담 |
| 토트넘 | tottenhamhotspur.com (공식) | **검색에 개별 기사 URL이 잡힐 때만.** manutd.com과 같은 이유 |
| 토트넘 | The Athletic | **유료.** 헤드라인과 자체 요약까지만 쓰고 상세 번역(`details.more`)은 넣지 않는다 |

그 밖의 매체도 쓸 수 있으나 출처를 반드시 명시한다.

실행 경험(2026-09-03 첫 실행)에서 확인된 제약:
- WebSearch의 `allowed_domains`에 bbc.com·theguardian.com·independent.co.uk·manchestereveningnews.co.uk 를 넣으면 API 400이 난다. **도메인 제한 없이 쿼리 문자열에 매체명을 넣어 검색한다** (예: `BBC Sport Manchester United`).
- Sky Sports 목록 페이지는 `https://www.skysports.com/premier-league-news` 와 `https://www.skysports.com/<팀 슬러그>-news` 를 연다 (`manchester-united-news`, `tottenham-hotspur-news`). `/football/news`는 비어 있다.
- 하루에 실제로 쓸 수 있는 매체는 2~3곳이 보통이다. 안 열리는 매체는 건너뛰고 보고에 적는다.
- 검색 결과에 **지난 시즌 기사**가 섞인다(같은 상대와의 2월 경기 등). 쿼리에 `2026`을 넣고, 0-D에서 읽은 다음 경기 날짜·상대와 맞는지 확인한 뒤 싣는다.

쿼리 예 — 리그 공통(한 번):
- `Premier League news today 2026`
- `Premier League transfer news 2026`
- `Premier League PSR VAR rules news 2026`

쿼리 예 — 팀별(팀마다 반복):
- `Manchester United news today 2026` · `Manchester United {0-D의 다음 상대} preview 2026`
- `Tottenham Hotspur news today 2026` · `Tottenham {0-D의 다음 상대} preview 2026` · `football.london Tottenham`

### 1-C. 기사 페이지 열기 — 생략 금지
카드로 실을 기사는 **각 페이지를 반드시 연다.** 도구를 둘로 나눠 쓴다.

**메타 태그 → Bash `curl`.** WebFetch는 페이지를 마크다운으로 바꾸면서 `<meta>`를 버리기 때문에 og:image를 주지 못한다. 브라우저 User-Agent를 붙여야 차단을 피한다.

```bash
for URL in "https://..." "https://..."; do
  echo "### $URL"
  curl -sL -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36" --max-time 25 "$URL" \
    | grep -oiE '<meta[^>]+(og:image|og:url|og:title|article:published_time)[^>]*>|<link[^>]+canonical[^>]*>' | head -8
done
```

여기서 뽑을 것: `og:image`(썸네일), `og:url`/canonical(정식 URL), `og:title`(원제), `article:published_time`(발행 시각).

**본문 → WebFetch.** prompt에 "기사 본문을 요약하고 핵심 인용문·수치를 그대로 포함해 달라"를 넣는다. 본문은 요약과 상세 번역의 재료다.

**BBC Sport는 WebFetch가 막혀 있다**("unable to fetch from www.bbc.com"). BBC 기사 본문은 curl로 받아 `<p>` 문단만 뽑는다:

```bash
curl -sL -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36" --max-time 25 "$URL" \
  | node -e "let h='';process.stdin.on('data',d=>h+=d).on('end',()=>{const ps=[...h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(m=>m[1].replace(/<[^>]+>/g,'').trim()).filter(t=>t.length>40);console.log(ps.join('\n\n'))})"
```

발행 시각: BBC는 `article:published_time` 메타가 없고 JSON-LD의 `datePublished`에 들어 있다. 메타 grep에 아래 패턴을 함께 돌린다.

```bash
curl -sL -A "Mozilla/5.0 ..." --max-time 25 "$URL" | grep -oE '"datePublished":"[^"]+"' | head -1
```

- fetch는 **3~4개씩 병렬**로 돌린다.
- BBC Sport나 Sky Sports 같은 큰 사이트 한 곳을 열면 "Latest/Related" 목록에서 개별 기사 URL을 한꺼번에 확보할 수 있다.
- **The Athletic은 유료.** 헤드라인과 자체 요약까지만 쓰고 상세 번역(`details.more`)은 넣지 않는다.
- 발행 시각이 없으면 `{{PUBLISHED}}`에 날짜만 쓴다. 지어내지 않는다.
- **두 번째 실행(2026-09-04)에서 확인된 것:** Sky Sports·Manchester Evening News·football.london은 봇 차단으로 본문이 비어 올 때가 많다(HTTP 000 또는 0바이트). 열리면 쓰고, 안 열리면 계획에 넣지 않는다.
- 구단 공식 사이트(manutd.com, tottenhamhotspur.com)는 기사 본문도 클라이언트 렌더링이라 curl로는 메타 태그만 온다. 공식 기사 카드는 **요약만 싣고 상세 번역(details.more)을 생략해도 된다.**
- 구단 공식 기사는 주소에 날짜가 없어 지난 시즌 기사가 섞이기 쉽다(예: 2월의 "Everton v Man Utd" 기자회견). **공식 사이트 기사는 예외 없이 JSON-LD `datePublished`를 확인**하고 이번 시즌 것만 싣는다.
- 썸네일 URL은 기사 og:image 값을 그대로 쓴다. 이미지 CDN(ichef.bbci.co.uk, e0.365dm.com 등)은 이 환경에서 직접 열리지 않을 수 있으니 바이트 검증은 하지 않는다.

---

## 2. 선별·분류

- **한 파일 최대 25건.** 같은 사건을 여러 매체가 다뤘으면 **취재가 가장 충실한 한 건만** 남긴다(공식 발표 > 1차 취재 > 인용 보도).
- **팀 기사 최소 5건.** 파일마다 `team`을 먼저 채우고 남은 자리를 리그 공통 소식으로 채운다.
- **그 파일의 팀이 주제인 기사는 내용과 무관하게 전부 `team`으로 보낸다.** 그 팀 이적설도 `transfer`가 아니라 `team`이다.
- 기사가 하나도 없는 카테고리는 **칩과 섹션을 통째로 지운다.**
- 이적시장 마감 직후 주간에는 `match` 기사가 거의 없다. 억지로 채우지 말고 있는 만큼만 싣는다.
- 팀 기사가 5건이 안 되는 날은 며칠 전 분석·매치 리포트를 **실제 발행일을 그대로 표시한 채** 넣어 채울 수 있다. 날짜를 숨기거나 새 기사처럼 쓰지 않는다.
- 용어 사전은 **그 파일에 실린 카드**에 나온 용어면 된다(팀 카드 포함). 따라서 용어 사전은 팀 파일마다 다를 수 있다. 리그 공통 카드만 파일 간에 동일하면 된다.
- 공통 카드가 두 파일에서 글자 하나까지 같아야 하므로, **카드를 한 번 데이터로 만들어 두고 팀 파일마다 그 데이터를 넣어 렌더링**한다. 파일마다 따로 번역하면 어긋난다.

| `data-cat` | 칩·섹션 제목 | 담는 것 | 범위 |
|---|---|---|---|
| `team` | `{{TEAM_BADGE}} {{TEAM_SHORT_KO}}` (예 🔴 맨유 / ⚪ 토트넘) | 이 파일의 팀 관련 전부 | **팀별** |
| `match` | ⚽ 매치위크 | 지원 팀이 아닌 구단들의 경기 프리뷰·리뷰·결과·부상 명단 | 공통 |
| `transfer` | 🔄 이적·계약 | 지원 팀 외 구단의 이적·재계약 | 공통 |
| `people` | 👤 선수·감독 | 선임·경질·인터뷰·개인사 | 공통 |
| `rules` | ⚖️ 규정·VAR·PSR | 리그 규정, VAR 판정, 재정 규정, 징계 | 공통 |
| `etc` | 📰 기타 | 위에 안 들어가는 것 | 공통 |
| `glossary` | 📖 오늘의 용어 | 그날 기사에 나온 용어만 | 공통 |

섹션 순서는 위 표 순서 그대로. `team`이 항상 맨 위다.

**모든 카드에 `data-clubs`를 붙인다.** 나중에 화면이 구단별로 걸러 쓰기 위한 값이다. 기사가 다루는 구단 키(`clubs.js`의 키)를 쉼표로 잇고 공백은 넣지 않는다.

- `data-clubs="manchester-united"` — 한 구단 기사
- `data-clubs="manchester-united,everton"` — 맞대결·이적 등 두 구단 이상
- `data-clubs=""` — 특정 구단이 없는 리그 전체 기사(규정 개정, 리그 통계 등)
- `team` 섹션 카드는 값에 **반드시 그 파일의 팀 키**를 포함한다.

---

## 3. 번역 규칙

- 고유명사는 **첫 등장에만 영문 병기**: 브루누 페르난데스(Bruno Fernandes), 올드 트래퍼드(Old Trafford).
- `p.sum` 2~3문장. 기사 핵심만.
- `details.more`의 상세 번역은 3~4문단. **전문 번역 금지** — 자기 말로 풀어 정리한다.
- 확인되지 않은 이적설은 "~라고 보도했습니다" 식으로 매체의 주장임을 드러낸다.
- 숫자(이적료·순위·득점)는 기사에 나온 값을 그대로 쓴다.
- 리그 공통 카드는 한 번만 번역해 모든 팀 파일에 **같은 문장 그대로** 넣는다. 파일마다 다시 쓰지 않는다.

---

## 4. 브리핑 HTML 생성 — 팀마다 한 번씩

### 4-A. 템플릿 복사
지원 팀 수만큼 복사한다. `<ISO>`는 0-A에서 읽은 값.

```bash
ISO=2026-09-05   # 0-A 의 ISO
for T in $(node -e "global.window={};require('./data.js');console.log(window.HUB.meta.teams.join(' '))"); do
  cp briefings/_template.html "briefings/epl-news-$ISO-$T.html"
done
```

Bash 도구는 호출마다 셸이 새로 뜬다. `ISO=` 는 **쓰는 호출마다 다시 지정**한다(6단계도 마찬가지).

복사본 맨 위의 설명 주석 블록(`<!-- ... -->`)은 **지운다.**

### 4-B. 채우기
템플릿 주석에 플레이스홀더 목록이 있다. 파일마다 전부 채운다.

- **팀 플레이스홀더** (0-C 표에서): `{{TEAM_KEY}}`, `{{TEAM_BADGE}}`, `{{TEAM_SHORT_KO}}`, `{{TEAM_NAME_KO}}`, `{{TEAM_NAME_EN}}`. 팀 색은 본문에 토큰이 없고 `{{PH_COLOR}}`의 기본값으로 쓴다(4-C).
  - `{{TEAM_KEY}}`는 `<html data-team="...">`에도 들어간다. 파일명 접미사와 같아야 한다.
  - `<title>`은 `EPL 데일리 브리핑 · {{TEAM_SHORT_KO}} — {{DATE_DOT}}` 형태로 팀 이름을 포함한다.
- **헤더**: `{{DATE_KO}}`, `{{DATE_DOT}}`, `{{SRC_COUNT}}`, `{{SRC_LIST}}`, `{{ART_COUNT}}`, `{{TEAM_COUNT}}`, `{{NEXT_LINE}}`
  - lede는 그 파일의 팀을 가리킨다: "그중 N건이 {{TEAM_NAME_KO}}({{TEAM_NAME_EN}}) 소식입니다."
  - `{{NEXT_LINE}}`은 0-D에서 읽은 **그 팀의** 다음 경기다.
- **오늘의 요약 3줄** — 순서 고정
  1. `{{DIGEST_1}}` 항상 **그 파일 팀**의 소식
  2. `{{DIGEST_2}}` 리그 전체 소식 (모든 팀 파일이 같아도 된다)
  3. `{{DIGEST_3}}` **그 팀의 다음 경기** (0-D). 다음 경기가 없으면 그날 그 팀 관련 가장 눈에 띄는 소식
- **칩**: `{{N_ALL}}`은 전체 카드 수, 나머지는 각 섹션 카드 수. 기사 없는 카테고리 칩은 삭제.
- **카드**: 템플릿의 카드 A(썸네일 있음) / 카드 B(플레이스홀더)를 복제해 쓴다. `data-clubs`(`{{CLUB_KEYS}}`)를 빠뜨리지 않는다.
- **용어**: `div.term`을 용어 수만큼 복제. `{{N_GLOSSARY}}`에 개수.

### 4-C. 썸네일
- og:image가 있으면 카드 A 형태: `<img src="..." alt="" loading="lazy">`.
- **`loading="lazy"` 외의 속성은 붙이지 않는다.** `referrerpolicy`, `<meta name="referrer">`, `onerror`로 숨기기 전부 금지.
- **og:image가 없어도 기사는 싣는다.** 카드 B 형태로 바꾸고 색을 정한다.

```html
<div class="thumb ph" style="--ph:#DA291C"><span>BBC Sport</span></div>
```

`{{PH_COLOR}}`는 기사가 특정 구단 한 곳에 관한 것이면 그 구단 색, 아니면 **그 파일 팀의 색**(0-C 표).

```bash
node -e "global.window={};require('./clubs.js');console.log(window.HUB_CLUBS['arsenal'].color)"
```

---

## 5. `briefings.js` 갱신

`window.HUB_BRIEFINGS = [` 바로 다음 줄에 오늘 항목을 **맨 앞에** 넣는다. **날짜당 항목 하나**, 그 안에 그날 만든 팀 파일을 전부 담는다. 항목 끝에 쉼표를 붙이면 배열이 비어 있든 아니든 항상 안전하다.

```js
window.HUB_BRIEFINGS = [
  { date: "2026-09-05",
    files: {
      "manchester-united": {
        file: "briefings/epl-news-2026-09-05-manchester-united.html", count: 19, team: 6,
        headline: "카릭, 에버턴전 앞두고 로테이션 시사 · 이적시장 마감 정리 · PSR 개정안 통과" },
      "tottenham-hotspur": {
        file: "briefings/epl-news-2026-09-05-tottenham-hotspur.html", count: 18, team: 5,
        headline: "토트넘, 노팅엄전 원정 명단 발표 · 이적시장 마감 정리 · PSR 개정안 통과" }
    } },
];
```

- 키는 팀 키. `HUB.meta.teams` 순서대로 쓴다(맨유가 먼저).
- `count` 그 파일의 전체 카드 수, `team` 그 팀 섹션 카드 수 — 4-B의 칩 숫자와 같아야 한다.
- `headline`은 헤드라인 2~3개를 ` · `로 연결하고, **첫 번째는 그 팀 소식**으로 한다. 두 번째부터는 리그 소식이라 팀 파일끼리 같아도 된다.
- 화면은 선택된 팀의 파일만 보여준다. 그날 그 팀 파일이 없으면 그 날짜는 목록에서 빠진다.
- `data.js`는 여기서 손대지 않는다.

---

## 6. 마무리 검증 — 생략 금지

저장소에 들어 있는 검사기 `scripts/check-briefing.mjs`를 **파일마다** 실행한다. 팀 키는 파일명 접미사에서 알아서 읽는다(`--team <팀키>`로 직접 줄 수도 있다).

```bash
ISO=2026-09-05   # 0-A 의 ISO — 이 호출에서 다시 지정한다
for T in $(node -e "global.window={};require('./data.js');console.log(window.HUB.meta.teams.join(' '))"); do
  echo "### $T"; node scripts/check-briefing.mjs "briefings/epl-news-$ISO-$T.html"
done
```

이어서 `briefings.js` 유효성과 파일 존재를 확인한다.

```bash
node -e "global.window={};require('./briefings.js');const fs=require('fs');const b=window.HUB_BRIEFINGS[0];console.log(b.date);for(const [k,v] of Object.entries(b.files))console.log(k,v.count,v.team,'exists:',fs.existsSync(v.file))"
```

검사 항목 정리 — 하나라도 걸리면 **고친 뒤에 커밋한다.**

1. `briefings.js`가 파싱되고 `[0].files`의 모든 `file`이 실제로 존재한다
2. 새 HTML마다 `{{` 플레이스홀더가 남아 있지 않다
3. 칩 숫자 = 섹션별 카드 수, `전체` 칩 = 총합
4. 모든 `a.go` href가 개별 기사 URL이다(사이트 루트 금지)
5. 파일마다 `team` 섹션 카드가 5건 이상이다
6. 모든 카드에 `data-clubs`가 있고, 팀 섹션 카드에는 그 팀 키가 들어 있다
7. 페이지가 `../briefing.css`와 `../briefing.js`를 읽는다
8. kicker에 허브로 돌아가는 `← RED DEVILS HUB` 링크가 있다

검사기의 `WARN`은 실패가 아니지만 **보고에 그대로 옮긴다.**
끝내 못 채운 항목이 있으면 **보고에 그대로 쓴다.** 채운 척하지 않는다.

---

## 7. 커밋·푸시

PowerShell here-string으로 여러 줄 메시지를 넘긴다. 닫는 `'@`는 반드시 줄 맨 앞(들여쓰기 없음).

```powershell
git add briefings/ briefings.js data.js
git commit -m @'
brief: 2026-09-05

맨유: 카릭, 에버턴전 앞두고 로테이션 시사
토트넘: 데 제르비, 노팅엄 원정 명단 발표
리그: PSR 개정안, 구단 투표에서 통과
'@
git -C C:/red-devils-hub push origin main
```

- 제목은 `brief: <ISO>` 고정.
- 본문은 **팀마다 한 줄**(그 팀 짧은 이름 + `: ` + 그날 그 팀 헤드라인) **+ 리그 한 줄**(`리그: ...`). 팀 줄 순서는 `HUB.meta.teams` 순서.
- `Co-Authored-By` 트레일러는 **넣지 않는다.**
- `origin`이 없거나 push가 실패하면 **에러 메시지를 그대로 보고하고 멈춘다.** 재시도를 반복하거나 성공한 것처럼 쓰지 않는다.

```bash
git remote -v
```

---

## 8. 보고

작업이 끝나면 다음을 알린다.

- **팀마다**: 만든 파일 경로, 전체 기사 수와 그중 팀 기사 수, 오늘의 요약 3줄
- 리그 공통 카드 수와 카테고리별 분포(모든 팀 파일에 공통으로 들어간 것)
- `node scripts/update-data.mjs` 결과 (성공 / 실패 시 에러 원문)
- 검증 8항목 결과와 검사기 `WARN`, 못 채운 항목이 있으면 이유
- 막힌 매체·검색 실패 등 걸림돌
- 커밋 해시와 push 결과
