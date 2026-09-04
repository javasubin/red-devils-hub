// ============================================================
//  브리핑 목록 — ROUTINE.md가 브리핑을 만들 때 맨 앞에 항목을 추가합니다.
//  날짜당 항목 하나, 그 안에 팀별 파일이 들어갑니다.
//  { date, files: { "<팀키>": { file, count, team, headline } } }  — SCHEMA.md 2절 참고
//  구버전(2026-09-03) 항목은 files 안에 manchester-united 하나만 있습니다.
// ============================================================
window.HUB_BRIEFINGS = [
  { date: "2026-09-04",
    files: {
      "manchester-united": {
        file: "briefings/epl-news-2026-09-04-manchester-united.html", count: 21, team: 5,
        headline: "맨유, 마감일 아이트누리 임대 시도 무산 · 첼시 39명 내보내고도 이적 수지 흑자 · 마르티넬리 6,000만 파운드 알힐랄행" },
      "tottenham-hotspur": {
        file: "briefings/epl-news-2026-09-04-tottenham-hotspur.html", count: 23, team: 7,
        headline: "토트넘, 리샬리송 프리미어리그 등록 명단 제외 · 첼시 39명 내보내고도 이적 수지 흑자 · 마르티넬리 6,000만 파운드 알힐랄행" }
    } },
  { date: "2026-09-03",
    files: {
      "manchester-united": {
        file: "briefings/epl-news-2026-09-03.html", count: 19, team: 6,
        headline: "맨유, 왼쪽 수비 보강 없이 시즌 강행 · 프리미어리그 여름 지출 34.9억 파운드 사상 최대 · 에버턴 데드라인 데이 파행에 팬 반발" }
    } },
];
