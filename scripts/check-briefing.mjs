#!/usr/bin/env node
// check-briefing.mjs — 브리핑 HTML 검사기 (ROUTINE.md 6절).
// 사용: node scripts/check-briefing.mjs briefings/epl-news-YYYY-MM-DD-<팀키>.html [--team <팀키>]
//   --team 을 안 주면 파일명 접미사에서 팀 키를 읽는다.
//   접미사도 없으면 구버전(맨유 단일, mu 섹션) 파일로 보고 data-clubs 검사를 경고로 낮춘다.
//   게시되는 페이지라 스크립트가 끼어들 틈도 막는다 — <script> 는 템플릿의 ../briefing.js 하나, on* 속성 · javascript: 금지,
//   카드 링크(a.go) · 썸네일(img)은 https 주소만, 태그는 허용 목록 안에서만.
// 사용: node scripts/check-briefing.mjs --index [--date YYYY-MM-DD]
//   briefings.js 검사 — 데이터 형식(맨 위 // 주석 줄 + window.HUB_BRIEFINGS = <JSON 배열>; 뿐)인지, 항목 모양,
//   첫 항목의 file 이 모두 있는지, --date 를 주면 첫 항목 date 가 그 날짜인지. 코드로 실행하지 않고 JSON 으로 읽는다.
import fs from 'node:fs';
import path from 'node:path';
import { readJsonAssignment, loadClubs } from './brief-env.mjs';

const argv = process.argv.slice(2);
let file = null, teamArg = null, indexMode = false, dateArg = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--team') { teamArg = argv[++i] ?? null; continue; }
  if (a.startsWith('--team=')) { teamArg = a.slice('--team='.length); continue; }
  if (a === '--index') { indexMode = true; continue; }
  if (a === '--date') { dateArg = argv[++i] ?? ''; continue; }
  if (a.startsWith('--date=')) { dateArg = a.slice('--date='.length); continue; }
  if (!file) file = a;
}
let usageOk;
if (indexMode) {
  const dateOk = dateArg === null || /^\d{4}-\d{2}-\d{2}$/.test(dateArg);
  usageOk = file === null && teamArg === null && dateOk;   // --index 는 파일 · --team 없이
} else {
  usageOk = file !== null && dateArg === null;             // 파일 검사는 --date 없이
}
if (!usageOk) {
  console.error('사용: node scripts/check-briefing.mjs <파일> [--team <팀키>]\n' +
                '      node scripts/check-briefing.mjs --index [--date YYYY-MM-DD]');
  process.exit(2);
}
if (indexMode) process.exit(checkIndex(dateArg));

const raw = fs.readFileSync(file, 'utf8');
const h = raw.replace(/<!--[\s\S]*?-->/g, '');   // 주석은 구조 검사에서 제외
const fail = [], warn = [];

// ── 팀 키: --team > 파일명 접미사 > 없음
const nameMatch = path.basename(file).match(/^epl-news-(\d{4}-\d{2}-\d{2})(?:-(.+))?\.html$/);
const teamKey = teamArg || (nameMatch && nameMatch[2]) || null;

// ── 플레이스홀더·템플릿 주석
const ph = raw.match(/\{\{[^}]*\}\}/g);
if (ph) fail.push('플레이스홀더 남음: ' + [...new Set(ph)].join(', '));
if (raw.includes('브리핑 페이지 뼈대')) fail.push('템플릿 설명 주석 블록을 지우지 않았음');

// ── 섹션·카드 수집
const cards = {};            // data-cat -> 카드 수
const artTags = [];          // { cat, tag }
const order = [];            // 문서에 나온 data-cat 순서
let m, total = 0;
const secRe = /<section id="([^"]+)" data-cat="([^"]+)">([\s\S]*?)<\/section>/g;
while ((m = secRe.exec(h))) {
  const tags = m[3].match(/<article class="art"[^>]*>/g) || [];
  cards[m[2]] = tags.length;
  order.push(m[2]);
  for (const tag of tags) artTags.push({ cat: m[2], tag });
  if (m[2] !== 'glossary') total += tags.length;
}

// team 섹션 (구버전 파일은 mu)
const teamCat = cards.team !== undefined ? 'team' : (cards.mu !== undefined ? 'mu' : null);
const legacyShape = teamCat === 'mu';
if (teamCat === null) fail.push('team 섹션이 없음 (구버전 파일이면 mu 섹션)');
else {
  if ((cards[teamCat] ?? 0) < 5) fail.push(`${teamCat} 섹션 카드 ${cards[teamCat]}건 — 5건 이상이어야 함`);
  if (order[0] !== teamCat) warn.push(`${teamCat} 섹션이 맨 위가 아님 (첫 섹션: ${order[0]})`);
}
if (total > 25) warn.push(`카드 ${total}건 — ROUTINE 상한 25건을 넘음`);

// <html data-team> 과 팀 키가 어긋나지 않는지
const docTeam = (h.match(/<html[^>]*\sdata-team="([^"]*)"/) || [])[1] || null;
if (docTeam && teamKey && docTeam !== teamKey) fail.push(`<html data-team="${docTeam}"> 가 팀 키 ${teamKey} 와 다름`);
if (!docTeam && !legacyShape) warn.push('<html data-team="..."> 없음');

// ── 칩 ↔ 섹션 대조
const chipRe = /<button class="chip" data-cat="([^"]+)"[^>]*>[^<]*(?:<span class="n">(\d+)<\/span>)?/g;
const chipCats = new Set();
while ((m = chipRe.exec(h))) {
  const cat = m[1];
  chipCats.add(cat);
  if (cat === 'glossary' || m[2] === undefined) continue;
  const want = cat === 'all' ? total : (cards[cat] ?? 0);
  if (Number(m[2]) !== want) fail.push(`칩 ${cat} = ${m[2]} 인데 실제 카드는 ${want}`);
}
for (const cat of Object.keys(cards)) {
  if (!chipCats.has(cat)) fail.push(`섹션 ${cat} 에 대응하는 칩이 없음`);
}

// ── 기사 URL (카드의 a.go): https 주소이고 개별 기사(사이트 루트 아님)
//   https 검사와 아래 "스크립트가 끼어들 틈" 검사는 주석을 지우지 않은 원문(raw)에서 한다 — 주석 끝을 브라우저와 다르게
//   읽게 만들어(--!> 등) 태그를 숨기는 것을 막으려고. 정상 브리핑에는 주석이 없거나 태그가 든 주석이 없다.
const HTTPS_URL = /^https:\/\/[^\s"'<>]+$/;
for (const a of startTags(raw, 'a').filter(t => /(?:^|\s)go(?:\s|$)/.test(t.attrs.get('class') ?? ''))) {
  const href = a.attrs.get('href') ?? '';
  if (!HTTPS_URL.test(href)) { fail.push('a.go 의 href 는 https:// 주소만 (따옴표 · <> · 공백 없이): ' + a.text); continue; }
  let u;
  try { u = new URL(href); } catch { fail.push('잘못된 URL: ' + href); continue; }
  if (u.pathname.replace(/\/+$/, '').split('/').filter(Boolean).length < 2)
    fail.push('개별 기사 URL이 아님(사이트 루트로 보임): ' + href);
}

// ── data-clubs (구버전 파일은 경고)
let clubKeys = null;
try {
  clubKeys = new Set(Object.keys(loadClubs()));
  if (!clubKeys.size) clubKeys = null;
} catch { clubKeys = null; }
if (!clubKeys) warn.push('clubs.js 를 읽지 못해 data-clubs 구단 키 검증은 건너뜀');

const missingDc = artTags.filter(a => !/\sdata-clubs="/.test(a.tag));
if (missingDc.length) {
  (legacyShape ? warn : fail).push(`data-clubs 없는 카드 ${missingDc.length}건 (전체 ${artTags.length}건)`);
}
for (const { cat, tag } of artTags) {
  const dc = tag.match(/\sdata-clubs="([^"]*)"/);
  if (!dc) continue;
  const keys = dc[1].split(',').map(s => s.trim()).filter(Boolean);
  if (clubKeys) for (const k of keys) if (!clubKeys.has(k)) fail.push('data-clubs 의 알 수 없는 구단 키: ' + k);
  if (cat === teamCat && teamKey && !keys.includes(teamKey))
    fail.push(`${teamCat} 섹션 카드의 data-clubs 에 ${teamKey} 가 없음: "${dc[1]}"`);
}

// ── 공통 링크·이미지
if (!h.includes('href="../briefing.css"')) fail.push('../briefing.css 링크 없음');
if (!h.includes('src="../briefing.js"')) fail.push('../briefing.js 링크 없음');
if (!/<a class="home" href="\.\.\/index\.html">/.test(h)) fail.push('kicker 의 허브 링크 없음');

// 썸네일: 템플릿에서 img 는 카드 썸네일뿐이라 모든 img 를 카드 img 로 본다
for (const t of startTags(raw, 'img')) {
  if (t.attrs.get('loading') !== 'lazy') fail.push('loading="lazy" 없는 img: ' + t.text);
  if (/onerror|referrerpolicy/i.test(t.text)) fail.push('금지 속성 사용: ' + t.text);
  if (!HTTPS_URL.test(t.attrs.get('src') ?? '')) fail.push('img 의 src 는 https:// 주소만 (따옴표 · <> · 공백 없이): ' + t.text);
}

// ── 스크립트가 끼어들 틈 (게시되는 페이지의 저장형 XSS 막기)
//   문맥(태그 · 속성값 · 글자 · 주석)을 가리지 않고 원문 전체에서 찾는다 — 정규식이 HTML 을 브라우저와 다르게 읽어도
//   빠져나갈 틈이 없게. 정상 브리핑의 글자(한국어 기사 요약 · 영문 제목 · URL)에는 걸릴 꼴이 없다.
const ALLOWED_TAGS = new Set([
  // 템플릿과 기존 브리핑에 있는 태그
  'html', 'head', 'meta', 'title', 'link', 'script', 'body', 'div', 'header', 'footer', 'section', 'article',
  'h1', 'h2', 'h3', 'p', 'b', 'br', 'span', 'a', 'ol', 'li', 'button', 'img', 'details', 'summary', 'svg', 'path',
  'dl', 'dt', 'dd',
  // 글자 꾸밈 · 목록 — 스스로 무엇을 불러오거나 실행하지 않는 것만. iframe · object · embed · base · form · style ·
  // SVG 애니메이션 등은 넣지 않는다(base 는 ../briefing.js 를 다른 서버 파일로 바꿔치기할 수 있다).
  'strong', 'em', 'i', 'u', 's', 'small', 'sub', 'sup', 'mark', 'abbr', 'time', 'cite', 'q', 'blockquote', 'ul', 'hr', 'wbr',
]);
const tagNames = new Set([...raw.matchAll(/<([a-z][^\s\/>]*)/gi)].map(t => t[1].toLowerCase()));
for (const t of tagNames) if (!ALLOWED_TAGS.has(t)) fail.push(`허용 목록에 없는 태그 <${t}> (템플릿에 있는 태그와 글자 꾸밈용만)`);
for (const a of raw.matchAll(/[\s\/"']on[a-z]+\s*=/gi)) fail.push('on* 속성(이벤트 처리기) 금지: ' + a[0].trim());
const scriptCount = (raw.match(/<script\b/gi) || []).length;
if (scriptCount !== 1 || !raw.includes('<script src="../briefing.js" defer></script>'))
  fail.push(`<script> 는 템플릿의 <script src="../briefing.js" defer></script> 하나만 (지금 <script ${scriptCount}개)`);
if (/javascript:|vbscript:/.test(revealSchemes(raw))) fail.push('javascript: · vbscript: 주소 금지 (문자 참조 · 공백으로 쪼갠 것 포함)');
if (/http-equiv/i.test(raw)) fail.push('<meta http-equiv> 금지 (새로고침으로 다른 주소에 보내기 등)');

if (warn.length) console.error('WARN\n- ' + [...new Set(warn)].join('\n- '));
if (fail.length) { console.error('FAIL\n- ' + [...new Set(fail)].join('\n- ')); process.exit(1); }
console.log(`OK — 팀 ${teamKey ?? '(미지정)'} · 카드 ${total}건 (${teamCat} ${cards[teamCat] ?? 0}건), 용어 ${(h.match(/<div class="term">/g) || []).length}개`);

// 이름이 name 인 시작 태그마다 { text: 태그 원문, attrs: 속성 Map }. 따옴표 안의 > 는 태그 끝으로 보지 않는다.
// 속성 이름은 소문자, 같은 이름이 두 번 나오면 처음 것(브라우저와 같음). 값은 적힌 그대로(엔티티를 풀지 않음).
function startTags(src, name) {
  const re = new RegExp(`<${name}(?=[\\s/>])(?:"[^"]*"|'[^']*'|[^"'>])*>`, 'gi');
  return [...src.matchAll(re)].map(([text]) => {
    const attrs = new Map();
    for (const a of text.matchAll(/([^\s=<>\/"']+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
      const k = a[1].toLowerCase();
      if (!attrs.has(k)) attrs.set(k, a[2] ?? a[3] ?? a[4]);
    }
    return { text, attrs };
  });
}

// javascript: 를 문자 참조(&#106; · &#x6A; · &colon; 등)나 공백 · 제어 문자로 쪼개 감춘 것까지 찾도록 풀고 지운다.
// 브라우저는 속성값의 문자 참조를 풀고, 주소 앞뒤 공백 · 제어 문자와 가운데 탭 · 줄바꿈을 지운 뒤 스킴을 읽는다.
function revealSchemes(s) {
  const ch = n => (n <= 0x10ffff ? String.fromCodePoint(n) : '');
  return s
    .replace(/&#x([0-9a-f]+);?/gi, (_, x) => ch(parseInt(x, 16)))
    .replace(/&#(\d+);?/g, (_, d) => ch(Number(d)))
    .replace(/&colon;/gi, ':')
    .replace(/&(tab|newline);/gi, '')
    .replace(/[\x00-\x20]/g, '')
    .toLowerCase();
}

// ── --index : briefings.js 검사 (ROUTINE.md 6절 검사 항목 1). 종료 코드를 돌려준다.
//   무인 실행이 고쳐 쓰는 파일이라 코드로 실행하지 않고 데이터로 읽는다(readJsonAssignment — 형식 밖 내용이 있으면 FAIL).
//   실행 스크립트(scripts/brief-bot.mjs, 예정)가 push 전에 이 검사로 "데이터뿐"임을 확인한다. file 경로는 저장소 루트 기준.
function checkIndex(date) {
  let list;
  try {
    list = readJsonAssignment('briefings.js', 'HUB_BRIEFINGS');
  } catch (e) {
    console.error('FAIL\n- briefings.js 가 데이터 형식이 아님 (맨 위 // 주석 줄 + window.HUB_BRIEFINGS = <JSON 배열>; 뿐이어야 함): ' + e.message);
    return 1;
  }
  if (!Array.isArray(list) || !list.length) {
    console.error('FAIL\n- window.HUB_BRIEFINGS 가 비어 있거나 배열이 아님');
    return 1;
  }

  const bad = list.flatMap((entry, i) => entryProblems(entry).map(p => `항목 [${i}] ${p}`));
  const rows = [];
  const first = list[0];
  if (!bad.length) {
    if (date && first.date !== date) bad.push(`첫 항목 date 가 ${first.date} — --date ${date} 와 다름 (그 날짜 항목이 맨 앞에 없음)`);
    for (const [team, v] of Object.entries(first.files)) {
      if (!fs.existsSync(new URL('../' + v.file, import.meta.url))) bad.push(`${team} 의 file 이 없음: ${v.file}`);
      else rows.push(`- ${team}  카드 ${v.count} · 팀 ${v.team}  ${v.file}`);
    }
  }
  if (bad.length) { console.error('FAIL\n- ' + bad.join('\n- ')); return 1; }
  console.log(`OK — briefings.js 데이터 형식 · 항목 ${list.length}개 모양 정상 · 첫 항목 ${first.date} · 파일 ${rows.length}개 모두 있음\n` + rows.join('\n'));
  return 0;
}

// 항목 하나의 모양 문제 목록. 화면(index.html)이 count · team 을 HTML 에 그대로, file 을 링크 주소로 넣으므로
// 타입과 경로 꼴까지 본다(숫자 자리에 태그 · file 에 javascript: 주소가 들어가지 않게).
function entryProblems(e) {
  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  if (!isObj(e)) return ['항목이 객체가 아님'];
  const p = [];
  if (typeof e.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) p.push(`date 가 YYYY-MM-DD 가 아님: ${JSON.stringify(e.date)}`);
  if (!isObj(e.files) || !Object.keys(e.files).length) return [...p, 'files 가 없거나 비어 있음'];
  for (const [team, v] of Object.entries(e.files)) {
    if (!/^[a-z0-9-]+$/.test(team)) p.push(`files 의 팀 키 꼴이 아님: ${JSON.stringify(team)}`);
    if (!isObj(v)) { p.push(`files.${team} 가 객체가 아님`); continue; }
    if (typeof v.file !== 'string' || !/^briefings\/epl-news-\d{4}-\d{2}-\d{2}(?:-[a-z0-9-]+)?\.html$/.test(v.file))
      p.push(`files.${team}.file 이 briefings/epl-news-<날짜>[-<팀키>].html 꼴이 아님: ${JSON.stringify(v.file)}`);
    for (const k of ['count', 'team'])
      if (!Number.isInteger(v[k]) || v[k] < 0) p.push(`files.${team}.${k} 가 0 이상 정수가 아님: ${JSON.stringify(v[k])}`);
    if (typeof v.headline !== 'string' || !v.headline.trim()) p.push(`files.${team}.headline 이 비었거나 문자열이 아님`);
  }
  return p;
}
