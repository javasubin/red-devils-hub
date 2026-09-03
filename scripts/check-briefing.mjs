#!/usr/bin/env node
// check-briefing.mjs — 브리핑 HTML 검사기 (ROUTINE.md 6단계).
// 사용: node scripts/check-briefing.mjs briefings/epl-news-YYYY-MM-DD.html
import fs from 'node:fs';
const file = process.argv[2];
const raw = fs.readFileSync(file, 'utf8');
const h = raw.replace(/<!--[\s\S]*?-->/g, '');   // 주석은 구조 검사에서 제외
const fail = [];

const ph = raw.match(/\{\{[^}]*\}\}/g);
if (ph) fail.push('플레이스홀더 남음: ' + [...new Set(ph)].join(', '));
if (raw.includes('브리핑 페이지 뼈대')) fail.push('템플릿 설명 주석 블록을 지우지 않았음');

const cards = {};
let m, total = 0;
const secRe = /<section id="([^"]+)" data-cat="([^"]+)">([\s\S]*?)<\/section>/g;
while ((m = secRe.exec(h))) {
  const n = (m[3].match(/<article class="art">/g) || []).length;
  cards[m[2]] = n;
  if (m[2] !== 'glossary') total += n;
}
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

for (const g of h.matchAll(/<a class="go" href="([^"]+)"/g)) {
  let u;
  try { u = new URL(g[1]); } catch { fail.push('잘못된 URL: ' + g[1]); continue; }
  if (u.pathname.replace(/\/+$/, '').split('/').filter(Boolean).length < 2)
    fail.push('개별 기사 URL이 아님(사이트 루트로 보임): ' + g[1]);
}

if ((cards.mu ?? 0) < 5) fail.push(`맨유 카드 ${cards.mu ?? 0}건 — 5건 이상이어야 함`);
if (!h.includes('href="../briefing.css"')) fail.push('../briefing.css 링크 없음');
if (!h.includes('src="../briefing.js"')) fail.push('../briefing.js 링크 없음');
if (!/<a class="home" href="\.\.\/index\.html">/.test(h)) fail.push('kicker 의 허브 링크 없음');

for (const t of h.matchAll(/<img [^>]*>/g)) {
  if (!/loading="lazy"/.test(t[0])) fail.push('loading="lazy" 없는 img: ' + t[0]);
  if (/onerror|referrerpolicy/.test(t[0])) fail.push('금지 속성 사용: ' + t[0]);
}

if (fail.length) { console.error('FAIL\n- ' + fail.join('\n- ')); process.exit(1); }
console.log(`OK — 카드 ${total}건 (맨유 ${cards.mu ?? 0}건), 용어 ${(h.match(/<div class="term">/g) || []).length}개`);
