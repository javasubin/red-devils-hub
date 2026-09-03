# RED DEVILS HUB 데일리 루틴 — EPL 브리핑 생성 + 허브 갱신 + 커밋

맨체스터 유나이티드와 프리미어리그 소식을 매일 한국어 브리핑으로 만들어 저장소에 쌓는다.
**이 문서만 보고 처음부터 끝까지 수행한다.** 저장소 루트(`C:\red-devils-hub`)에서 작업한다.

> 스포일러 차단 장치는 없다. 경기 결과·순위·득점자를 그대로 쓴다.
> 손대지 않는 파일: `index.html`, `club.html`, `clubs.js`, `scripts/update-data.mjs`.
> `data.js`는 0단계 스크립트가 통째로 다시 쓰므로 손으로 편집하지 않는다.

---

## 0. 날짜 확인과 데이터 갱신

### 0-A. 오늘 날짜 (KST)
Bash 도구로 한 번에 뽑는다. 기계 시간대와 무관하게 서울 기준이다.

```bash
node -e "const d=new Date(),z={timeZone:'Asia/Seoul'};const iso=new Intl.DateTimeFormat('sv-SE',z).format(d);console.log('ISO  '+iso);console.log('DOT  '+iso.replace(/-/g,'.'));console.log('KO   '+new Intl.DateTimeFormat('ko-KR',{...z,dateStyle:'full'}).format(d))"
```

- `ISO` → 파일명 `briefings/epl-news-<ISO>.html`, `briefings.js`의 `date`
- `DOT` → `{{DATE_DOT}}` (`<title>`, 푸터)
- `KO` → `{{DATE_KO}}` (헤더 kicker)

### 0-B. 경기·순위 데이터 갱신
```bash
node scripts/update-data.mjs
```
BBC Sport를 파싱해 `data.js` 전체를 다시 쓴다. Claude가 내용을 만들지 않는다.
Node가 없거나 스크립트가 실패하면 **에러 원문을 보고에 남기고 브리핑 작업은 그대로 진행한다.**

### 0-C. 다음 맨유 경기 확인
검색 쿼리와 `{{NEXT_LINE}}`에 쓸 상대팀·날짜를 `data.js`에서 읽는다.

```bash
node -e "global.window={};require('./data.js');const f=window.HUB.fixtures.filter(x=>x.mu&&x.status!=='post'&&x.kickoff).sort((a,b)=>a.kickoff<b.kickoff?-1:1)[0];console.log(f?JSON.stringify({comp:f.comp,kickoff:f.kickoff,home:f.home.name,away:f.away.name}):'없음')"
```

---

## 1. 기사 수집 — 2단계 필수

### 1-A. 검색 (WebSearch)
고정 매체: **BBC Sport, The Guardian, Sky Sports, The Athletic, ESPN, The Independent, Manchester Evening News, manutd.com(공식)**.
그 밖의 매체도 쓸 수 있으나 출처를 반드시 명시한다.

쿼리 예:
- `Manchester United news today`
- `Manchester United {0-C에서 확인한 다음 상대} preview`
- `Premier League news today`
- `Premier League transfer news`
- `PSR / VAR / Premier League rules news`

### 1-B. 기사 페이지 열기 — 생략 금지
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

- fetch는 **3~4개씩 병렬**로 돌린다.
- BBC Sport나 Sky Sports 같은 큰 사이트 한 곳을 열면 "Latest/Related" 목록에서 개별 기사 URL을 한꺼번에 확보할 수 있다.
- **The Athletic은 유료.** 헤드라인과 자체 요약까지만 쓰고 상세 번역(`details.more`)은 넣지 않는다.
- 발행 시각이 없으면 `{{PUBLISHED}}`에 날짜만 쓴다. 지어내지 않는다.

---

## 2. 선별·분류

- **최대 20건.** 같은 사건을 여러 매체가 다뤘으면 **취재가 가장 충실한 한 건만** 남긴다(공식 발표 > 1차 취재 > 인용 보도).
- **맨유 기사 최소 5건.** `mu`를 먼저 채우고 남은 자리를 리그 전체 소식으로 채운다.
- **맨체스터 유나이티드가 주제인 기사는 내용과 무관하게 전부 `mu`로 보낸다.** 맨유 이적설도 `transfer`가 아니라 `mu`다.
- 기사가 하나도 없는 카테고리는 **칩과 섹션을 통째로 지운다.**

| `data-cat` | 칩·섹션 제목 | 담는 것 |
|---|---|---|
| `mu` | 🔴 맨유 | 맨유 관련 전부 |
| `match` | ⚽ 매치위크 | 다른 팀 경기 프리뷰·리뷰·결과·부상 명단 |
| `transfer` | 🔄 이적·계약 | 맨유 외 구단의 이적·재계약 |
| `people` | 👤 선수·감독 | 선임·경질·인터뷰·개인사 |
| `rules` | ⚖️ 규정·VAR·PSR | 리그 규정, VAR 판정, 재정 규정, 징계 |
| `etc` | 📰 기타 | 위에 안 들어가는 것 |
| `glossary` | 📖 오늘의 용어 | 그날 기사에 나온 용어만 |

섹션 순서는 위 표 순서 그대로.

---

## 3. 번역 규칙

- 고유명사는 **첫 등장에만 영문 병기**: 브루누 페르난데스(Bruno Fernandes), 올드 트래퍼드(Old Trafford).
- `p.sum` 2~3문장. 기사 핵심만.
- `details.more`의 상세 번역은 3~4문단. **전문 번역 금지** — 자기 말로 풀어 정리한다.
- 확인되지 않은 이적설은 "~라고 보도했습니다" 식으로 매체의 주장임을 드러낸다.
- 숫자(이적료·순위·득점)는 기사에 나온 값을 그대로 쓴다.

---

## 4. 브리핑 HTML 생성

### 4-A. 템플릿 복사
```bash
cp briefings/_template.html "briefings/epl-news-<ISO>.html"
```
복사본 맨 위의 설명 주석 블록(`<!-- ... -->`)은 **지운다.**

### 4-B. 채우기
템플릿 주석에 플레이스홀더 목록이 있다. 전부 채운다.

- **헤더**: `{{DATE_KO}}`, `{{DATE_DOT}}`, `{{SRC_COUNT}}`, `{{SRC_LIST}}`, `{{ART_COUNT}}`, `{{MU_COUNT}}`, `{{NEXT_LINE}}`
- **오늘의 요약 3줄** — 순서 고정
  1. `{{DIGEST_1}}` 항상 맨유 소식
  2. `{{DIGEST_2}}` 리그 전체 소식
  3. `{{DIGEST_3}}` 맨유 다음 경기, 없으면 그날 가장 눈에 띄는 다른 소식
- **칩**: `{{N_ALL}}`은 전체 카드 수, 나머지는 각 섹션 카드 수. 기사 없는 카테고리 칩은 삭제.
- **카드**: 템플릿의 카드 A(썸네일 있음) / 카드 B(플레이스홀더)를 복제해 쓴다.
- **용어**: `div.term`을 용어 수만큼 복제. `{{N_GLOSSARY}}`에 개수.

### 4-C. 썸네일
- og:image가 있으면 카드 A 형태: `<img src="..." alt="" loading="lazy">`.
- **`loading="lazy"` 외의 속성은 붙이지 않는다.** `referrerpolicy`, `<meta name="referrer">`, `onerror`로 숨기기 전부 금지.
- **og:image가 없어도 기사는 싣는다.** 카드 B 형태로 바꾸고 색을 정한다.

```html
<div class="thumb ph" style="--ph:#DA291C"><span>BBC Sport</span></div>
```

`--ph` 색은 기사가 특정 구단 한 곳에 관한 것이면 그 구단 색, 아니면 `#DA291C`.

```bash
node -e "global.window={};require('./clubs.js');console.log(window.HUB_CLUBS['arsenal'].color)"
```

---

## 5. `briefings.js` 갱신

`window.HUB_BRIEFINGS = [` 바로 다음 줄에 오늘 항목을 **맨 앞에** 넣는다. 항목 끝에 쉼표를 붙이면 배열이 비어 있든 아니든 항상 안전하다.

```js
window.HUB_BRIEFINGS = [
  { date: "2026-09-04", file: "briefings/epl-news-2026-09-04.html",
    count: 18, mu: 6,
    headline: "아모림, 에버턴전 로테이션 시사 · 이적시장 마감 정리 · PSR 개정안 통과" },
];
```

- `count` 전체 카드 수, `mu` 맨유 카드 수 — 4-B의 칩 숫자와 같아야 한다.
- `headline`은 헤드라인 2~3개를 ` · `로 연결하고, **첫 번째는 맨유 소식**으로 한다.
- `data.js`는 여기서 손대지 않는다.

---

## 6. 마무리 검증 — 생략 금지

저장소에 들어 있는 검사기 `scripts/check-briefing.mjs`를 실행한다. (플레이스홀더 잔존, 칩 숫자, 기사 URL, 맨유 5건, 공유 CSS·JS 링크, 허브 링크, img 속성을 검사한다.)

```bash
node scripts/check-briefing.mjs "briefings/epl-news-<ISO>.html"
```

이어서 `briefings.js` 유효성과 파일 존재를 확인한다.

```bash
node -e "global.window={};require('./briefings.js');const b=window.HUB_BRIEFINGS[0];console.log(b);console.log('file exists:', require('fs').existsSync(b.file))"
```

검사 항목 정리 — 하나라도 걸리면 **고친 뒤에 커밋한다.**

1. `briefings.js`가 파싱되고 `[0].file`이 실제로 존재한다
2. 새 HTML에 `{{` 플레이스홀더가 남아 있지 않다
3. 칩 숫자 = 섹션별 카드 수, `전체` 칩 = 총합
4. 모든 `a.go` href가 개별 기사 URL이다(사이트 루트 금지)
5. `mu` 섹션 카드가 5건 이상이다
6. 페이지가 `../briefing.css`와 `../briefing.js`를 읽는다
7. kicker에 허브로 돌아가는 `← RED DEVILS HUB` 링크가 있다

끝내 못 채운 항목이 있으면 **보고에 그대로 쓴다.** 채운 척하지 않는다.

---

## 7. 커밋·푸시

PowerShell here-string으로 여러 줄 메시지를 넘긴다. 닫는 `'@`는 반드시 줄 맨 앞(들여쓰기 없음).

```powershell
git add briefings/ briefings.js data.js
git commit -m @'
brief: 2026-09-04

아모림, 에버턴전 앞두고 로테이션 시사
여름 이적시장 마감 — 프리미어리그 총지출 사상 최대
PSR 개정안, 구단 투표에서 통과
'@
git -C C:/red-devils-hub push origin main
```

- 제목은 `brief: <ISO>` 고정. 본문은 그날 헤드라인 **3줄**(한 줄에 하나).
- `Co-Authored-By` 트레일러는 **넣지 않는다.**
- `origin`이 없거나 push가 실패하면 **에러 메시지를 그대로 보고하고 멈춘다.** 재시도를 반복하거나 성공한 것처럼 쓰지 않는다.

```bash
git remote -v
```

---

## 8. 보고

작업이 끝나면 다음을 알린다.

- 만든 파일 경로와 기사 수(맨유 몇 건 포함)
- 오늘의 요약 3줄
- `node scripts/update-data.mjs` 결과 (성공 / 실패 시 에러 원문)
- 검증 7항목 결과, 못 채운 항목이 있으면 이유
- 커밋 해시와 push 결과
