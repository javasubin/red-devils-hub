# RED DEVILS HUB — 맨유 · 프리미어리그 개인 대시보드

맨체스터 유나이티드를 중심으로 프리미어리그 한 시즌을 한 화면에서 따라가려고 만든 정적 사이트다.
프리미어리그 380경기 달력(맨유의 컵·유럽대항전 포함)과 다음 경기, 다가오는 일정, 시즌 진행률, 순위표와 득점 순위,
맨유 최근 경기, 이번 매치위크 스코어보드, 20개 구단 가이드, 그리고 날짜별 뉴스 브리핑 아카이브를 보여준다.
**결과를 가리는 장치는 없다.** 스코어와 순위는 처음부터 그대로 보인다.

## 구조

```
index.html            대시보드 (달력 · 다음 경기 · 시즌 진행 · 순위표 · 스코어보드 · 브리핑 아카이브)
club.html             구단 가이드 템플릿 — club.html?club=arsenal
data.js               일정 · 결과 · 순위표 · 득점 순위   ← 스크립트가 생성 (손으로 편집하지 않음)
briefings.js          브리핑 목록 (날짜 → 팀별 파일 · 기사 수 · 헤드라인)
clubs.js              20개 구단 정보 (한국어명 · 색 · 구장 · 역사 · 관전 포인트)
briefing.css          브리핑 페이지 공통 스타일
briefing.js           브리핑 페이지 공통 스크립트 (카테고리 칩 필터)
briefings/            날짜·팀별 브리핑 HTML (epl-news-YYYY-MM-DD-<팀키>.html) + _template.html
scripts/update-data.mjs   BBC Sport를 파싱해 data.js를 다시 쓰는 스크립트
scripts/update-matches.mjs  경기 상세(라인업·교체·카드·팀 통계)를 matches/<id>.js 로 쓰는 스크립트
matches/              경기별 상세 파일 + index.js   ← 스크립트가 생성
match-view.js/.css    경기 상세 패널(타임라인·통계·라인업) 공통 렌더러
.github/workflows/update.yml  GitHub Actions: 15분 주기 데이터 갱신
scripts/update-and-push.cmd  위 스크립트 실행 + 커밋·푸시 (작업 스케줄러용)
scripts/check-briefing.mjs   브리핑 HTML 검사기 (ROUTINE 6단계)
ROUTINE.md            브리핑을 만드는 매일 실행 절차 (Claude Code용)
SCHEMA.md             data.js · briefings.js · clubs.js 데이터 구조 정의
```

빌드 없음. 번들러도 패키지 의존성도 없다. 외부에서 가져오는 것은 Pretendard 웹폰트(jsDelivr),
BBC 구단 배지 SVG, 위키미디어 공용의 구장 사진, 그리고 기사 썸네일뿐이다.

## 데이터 흐름

두 갈래가 서로 독립적으로 돌아간다.

- **경기·순위**: BBC Sport → `node scripts/update-data.mjs` → `data.js`. Claude가 관여하지 않는 순수 스크립트다.
- **경기 상세**: BBC Sport → `node scripts/update-matches.mjs` → `matches/<id>.js`. 킥오프 90분 전부터 종료 후까지 라인업·득점·교체·카드·팀 통계를 받고, 끝난 경기는 최종 기록으로 한 번 더 받는다. 화면은 경기 줄을 눌렀을 때 그 파일만 읽는다.
- **뉴스**: 해외 매체 → `ROUTINE.md` 절차를 Claude Code가 수행 → 지원 팀마다 `briefings/epl-news-YYYY-MM-DD-<팀키>.html` + `briefings.js`에 날짜 항목 하나(팀별 파일을 함께 담는다) 추가.

브리핑이 하나도 없어도 사이트는 정상 동작한다. 아카이브 영역만 비어 있다.

## 실행

Node 22 이상이면 된다. `npm install` 없이 그대로 돌아간다.

```bash
node scripts/update-data.mjs
```

### 자동 갱신 (GitHub Actions — 기본)

`.github/workflows/update.yml`이 GitHub에서 두 스크립트를 돌리고 변경이 있으면 커밋·푸시한다. PC가 꺼져 있어도 돌아간다.

- 경기 시간대(한국 20시~다음날 08시)에는 **15분마다**: 라인업 발표(킥오프 약 1시간 전), 진행 중 스코어, 종료 후 최종 기록
- 매일 **09시(KST)**: 전체 갱신
- 저장소 Actions 탭에서 `update-data` 워크플로를 **Run workflow**로 수동 실행할 수도 있다
- 커밋 메시지는 `data: YYYY-MM-DD HH:MM`, 작성자 `red-devils-hub-bot`

### 수동 갱신 (Windows 작업 스케줄러 — 선택)

GitHub Actions를 쓰지 않을 때의 대안이다. `scripts/update-and-push.cmd`가 갱신부터 푸시까지 한다. 바뀐 게 없으면 커밋하지 않고 조용히 끝난다.

```cmd
schtasks /create /sc daily /st 09:00 /tn "RedDevilsHub" /tr "C:\red-devils-hub\scripts\update-and-push.cmd"
```

등록 확인은 `schtasks /query /tn "RedDevilsHub"`, 삭제는 `schtasks /delete /tn "RedDevilsHub" /f`.
**PC가 켜져 있어야 실행된다.** 꺼져 있던 날은 건너뛰므로, 다음에 켰을 때 스크립트를 한 번 직접 돌리면 된다.

## 브리핑 만들기

Claude Code에서 저장소를 연 뒤 이렇게 말한다.

```
ROUTINE.md대로 오늘 브리핑 만들어줘
```

`ROUTINE.md`에 날짜 계산부터 기사 수집, HTML 생성, 검증, 커밋·푸시까지 전부 적혀 있다.

한 번 돌리면 **지원 팀마다 파일이 하나씩** 나온다(`data.js`의 `HUB.meta.teams` — 지금은 맨유·토트넘).
파일 이름은 `briefings/epl-news-YYYY-MM-DD-<팀키>.html`이다. 리그 전체 소식(매치위크·이적·계약·선수·감독·규정·기타)은
한 번만 모아 그날 모든 팀 파일에 똑같이 넣고, 맨 위 팀 섹션만 파일마다 다르다(그 팀 기사 5건 이상).
카드마다 `data-clubs="<구단 키>"`가 붙어 있어 나중에 화면에서 구단별로 걸러 쓸 수 있다.

대시보드의 브리핑 아카이브는 **화면에서 고른 팀**의 파일만 보여준다. 팀을 바꾸면 같은 날짜라도 다른 파일이 열린다.

기사를 읽고 번역하는 과정에서 웹 검색과 페이지 열기를 많이 쓰므로 **유료 Claude 플랜이 필요하다.**
브리핑을 만들지 않아도 대시보드는 `data.js`만으로 동작한다.

## 배포

GitHub Pages로 올린다. 빌드 설정이 없어서 저장소를 그대로 서빙하면 된다.

1. GitHub에 `javasubin/red-devils-hub` 저장소를 만들고 push
2. Settings → Pages → Build and deployment
3. Source: **Deploy from a branch**
4. Branch: **main** / 폴더 **/ (root)** → Save

몇 분 뒤 `https://javasubin.github.io/red-devils-hub/` 에서 열린다. 이후 push할 때마다 자동 배포된다.

## 출처와 주의

- 경기 일정·결과·순위표·득점 순위는 **BBC Sport** 페이지를 파싱한 것이다. 개인 용도로만 쓴다.
- 구단 배지는 BBC 정적 자산을 핫링크한다. 별도로 저장하지 않는다.
- 구장 사진은 **위키미디어 공용(Wikimedia Commons)**에서 가져오며, 화면에 작성자와 라이선스를 함께 표시한다.
- 기사 저작권은 각 매체에 있다. 브리핑은 한국어 요약과 원문 링크만 제공하며 전문을 옮기지 않는다.
