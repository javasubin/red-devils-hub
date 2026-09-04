#!/usr/bin/env node
// check-briefing.mjs — 브리핑 HTML 검사기 (ROUTINE.md 6단계).
// 사용: node scripts/check-briefing.mjs briefings/epl-news-YYYY-MM-DD-<팀키>.html [--team <팀키>]
//   --team 을 안 주면 파일명 접미사에서 팀 키를 읽는다.
//   접미사도 없으면 구버전(맨유 단일, mu 섹션) 파일로 보고 data-clubs 검사를 경고로 낮춘다.
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
let file = null, teamArg = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--team') { teamArg = argv[++i] ?? null; continue; }
  if (a.startsWith('--team=')) { teamArg = a.slice('--team='.length); continue; }
  if (!file) file = a;
}
if (!file) {
  console.error('사용: node scripts/check-briefing.mjs <파일> [--team <팀키>]');
  process.exit(2);
}

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

// ── 기사 URL
for (const g of h.matchAll(/<a class="go" href="([^"]+)"/g)) {
  let u;
  try { u = new URL(g[1]); } catch { fail.push('잘못된 URL: ' + g[1]); continue; }
  if (u.pathname.replace(/\/+$/, '').split('/').filter(Boolean).length < 2)
    fail.push('개별 기사 URL이 아님(사이트 루트로 보임): ' + g[1]);
}

// ── data-clubs (구버전 파일은 경고)
let clubKeys = null;
try {
  const src = fs.readFileSync(new URL('../clubs.js', import.meta.url), 'utf8');
  const w = {};
  new Function('window', src)(w);
  clubKeys = new Set(Object.keys(w.HUB_CLUBS || {}));
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

for (const t of h.matchAll(/<img [^>]*>/g)) {
  if (!/loading="lazy"/.test(t[0])) fail.push('loading="lazy" 없는 img: ' + t[0]);
  if (/onerror|referrerpolicy/.test(t[0])) fail.push('금지 속성 사용: ' + t[0]);
}

if (warn.length) console.error('WARN\n- ' + [...new Set(warn)].join('\n- '));
if (fail.length) { console.error('FAIL\n- ' + [...new Set(fail)].join('\n- ')); process.exit(1); }
console.log(`OK — 팀 ${teamKey ?? '(미지정)'} · 카드 ${total}건 (${teamCat} ${cards[teamCat] ?? 0}건), 용어 ${(h.match(/<div class="term">/g) || []).length}개`);
