#!/usr/bin/env node
// brief-env.mjs — 브리핑 시작 정보를 한 번에 출력한다 (ROUTINE.md 0-A · 0-C · 0-D, 4-C).
// 사용: node scripts/brief-env.mjs           오늘 날짜(KST) · 지원 팀 · 팀별 다음 경기
//       node scripts/brief-env.mjs --clubs   clubs.js 의 전 구단: 키 | 한국어명 | 영문명 | 색 (data-clubs 값 · {{PH_COLOR}})
//   data.js · clubs.js 는 읽기만 한다. 외부 패키지 없음(Node 22 내장만).
//   저장소 데이터 파일을 읽는 두 함수(readJsonAssignment · loadClubs)는 check-briefing.mjs 도 가져다 쓴다.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

// 저장소 루트 기준으로 읽는다(어느 폴더에서 실행해도 같게).
const readRepoFile = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');

// "맨 위 // 주석 줄 + window.<globalName> = <JSON>;" 꼴 파일(data.js · briefings.js)을 코드로 실행하지 않고 데이터로 읽는다.
// 그 밖의 내용(덧붙인 코드 · 블록 주석 등)이 있거나 JSON 이 아니면 예외를 던진다. 무인 실행이 고쳐 쓰는 briefings.js 를
// 실행하면 거기 심은 코드가 Node 권한으로 돌아 "Bash 는 보조 스크립트만" 울타리(ROUTINE.md 무인 실행 절)를 넘기 때문이다.
export function readJsonAssignment(name, globalName) {
  let text = readRepoFile(name);
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);   // BOM
  // 줄은 JS 와 같은 기준(CRLF · LF · CR · U+2028 · U+2029 — \p{Zl} · \p{Zp} 가 뒤의 둘)으로 나눈다.
  // 주석 줄에 U+2028 을 숨겨 그 뒤를 코드로 만드는 것을 막는다.
  const lines = text.split(/\r\n|[\n\r\p{Zl}\p{Zp}]/u);
  let i = 0;
  while (i < lines.length && /^\s*(\/\/.*)?$/.test(lines[i])) i++;   // 맨 위 // 주석 줄과 빈 줄
  const head = `window.${globalName} = `;
  const rest = lines.slice(i).join('\n');
  if (!rest.startsWith(head)) throw new Error(`맨 위 // 주석 줄 다음이 "${head}" 로 시작하지 않음`);
  const m = rest.slice(head.length).match(/^([\s\S]*);\s*$/);
  if (!m) throw new Error('끝이 ";" 로 끝나지 않음');
  try {
    // __proto__ 키는 JSON.parse 와 브라우저(JS 객체 리터럴)가 다르게 읽으므로 받지 않는다.
    return JSON.parse(m[1], (k, v) => { if (k === '__proto__') throw new Error('__proto__ 키는 쓸 수 없음'); return v; });
  } catch (e) {
    throw new Error(`"${head}" 뒤가 JSON 이 아님 (그 밖의 코드 · 주석이 있거나 문법 오류) — ${e.message}`);
  }
}

// clubs.js 는 키에 따옴표가 없는 JS 객체라 JSON 으로 못 읽어, 가짜 window 를 넘겨 실행해 값을 꺼낸다.
// 실행해도 되는 까닭: 무인 실행이 쓸 수 있는 곳은 briefings/ · briefings.js · tmp-brief/ 뿐이라 clubs.js 를 고칠 수 없고,
// 실행 스크립트가 실행마다 원격 최신으로 되돌리는 저장소 파일이라 사람이 커밋한 내용만 들어 있다.
// 보조 스크립트에서 "가짜 window 로 실행"하는 곳은 이 함수 하나다. 실패하면 예외 — 처리는 부르는 쪽에서.
export function loadClubs() {
  const w = {};
  new Function('window', readRepoFile('clubs.js'))(w);
  return w.HUB_CLUBS || {};
}

// ── --clubs : 4-C 의 구단 색 찾기와 data-clubs 키 확인용
function printClubs(C) {
  const out = ['## 구단 (키 | 한국어명 | 영문명 | 색) — clubs.js. 키는 data-clubs 값, 색은 {{PH_COLOR}}'];
  for (const [k, c] of Object.entries(C)) out.push([k, c.ko || '?', c.name || '?', c.color || '?'].join(' | '));
  console.log(out.join('\n'));
}

function printEnv(H, C) {
  if (!H || !H.meta || !Array.isArray(H.meta.teams) || !Array.isArray(H.fixtures)) {
    console.error('data.js 에 HUB.meta.teams 또는 HUB.fixtures 가 없음');
    process.exit(1);
  }

  // ── 0-A 오늘 날짜: 기계 시간대와 무관하게 서울 기준
  const now = new Date();
  const KST = { timeZone: 'Asia/Seoul' };
  const iso = new Intl.DateTimeFormat('sv-SE', KST).format(now);   // sv-SE 는 YYYY-MM-DD 형식
  const out = [
    '## 0-A 오늘 날짜 (KST)',
    'ISO  ' + iso,
    'DOT  ' + iso.replace(/-/g, '.'),
    'KO   ' + new Intl.DateTimeFormat('ko-KR', { ...KST, dateStyle: 'full' }).format(now),
  ];

  // ── 0-C 지원 팀: HUB.meta.teams 순서, 색이 없으면 맨유 색
  out.push('', '## 0-C 지원 팀 (키 | 한국어명 | 영문명 | 색) — 첫 줄이 기본 팀');
  for (const t of H.meta.teams) {
    const c = C[t] || {};
    out.push([t, c.ko || '?', c.name || '?', c.color || '#DA291C'].join(' | '));
  }

  // ── 0-D 팀별 다음 경기: fav 에 그 팀이 있고 끝나지 않은(status ≠ post) 경기 중 킥오프가 가장 이른 것
  out.push('', '## 0-D 팀별 다음 경기 (키 | 대회 | 킥오프(UTC) | 홈 | 원정) — 끝난 경기 제외');
  for (const t of H.meta.teams) {
    const f = H.fixtures
      .filter(x => (x.fav || []).includes(t) && x.status !== 'post' && x.kickoff)
      .sort((a, b) => (a.kickoff < b.kickoff ? -1 : a.kickoff > b.kickoff ? 1 : 0))[0];
    out.push(f ? [t, f.comp, f.kickoff, f.home.name, f.away.name].join(' | ') : `${t} | 없음`);
  }
  console.log(out.join('\n'));
}

// 이름을 붙여 읽고, 못 읽으면 이유를 찍고 끝낸다.
function readOrExit(name, read) {
  try { return read(); } catch (e) {
    console.error(`${name} 를 읽지 못함: ${e.message}`);
    process.exit(1);
  }
}

function main() {
  const argv = process.argv.slice(2);
  const clubsMode = argv.length === 1 && argv[0] === '--clubs';
  if (argv.length && !clubsMode) {
    console.error('사용: node scripts/brief-env.mjs [--clubs]');
    process.exit(2);
  }
  const clubs = readOrExit('clubs.js', loadClubs);
  if (clubsMode) printClubs(clubs);
  else printEnv(readOrExit('data.js', () => readJsonAssignment('data.js', 'HUB')), clubs);
}

// 직접 실행했을 때만 출력한다(check-briefing.mjs 가 위 함수들을 가져다 쓸 때는 돌지 않게).
// import.meta.main 은 Node 22.18 부터 있어서, 그 전 버전은 실행한 파일 경로와 비교한다.
if (import.meta.main ?? import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
