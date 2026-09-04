#!/usr/bin/env node
// ============================================================
//  update-matches.mjs — 경기 상세(라인업·교체·카드·팀 통계)를 BBC에서 받아 matches/<id>.js 로 씁니다.
//  Node 22+, 외부 패키지 없음.  실행: node scripts/update-matches.mjs  (data.js가 먼저 갱신되어 있어야 함)
//  대상: data.js 의 PL 전 경기 + 맨유 전 대회 경기 중
//    - 킥오프 90분 전 ~ 종료 후 4시간 (라인업 발표·진행 상황)
//    - 끝났는데 아직 최종 기록(final)이 없는 경기 (백필)
//  옵션: --all      끝난 경기 전부 다시 받기      --ids id1,id2  특정 경기만
//  구조: SCHEMA.md 4절
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "matches");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const HEADERS = { "user-agent": UA, "accept-language": "en-GB,en;q=0.9", accept: "application/json" };
const PRE_MIN = 90, POST_HOURS = 4;

const args = process.argv.slice(2);
const OPT_ALL = args.includes("--all");
const OPT_IDS = args.includes("--ids") ? (args[args.indexOf("--ids") + 1] || "").split(",").filter(Boolean) : [];

function log(...a) { console.log(new Date().toISOString().slice(11, 19), ...a); }
function kstNow() { return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Seoul" }).replace(" ", "T") + "+09:00"; }
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchJson(url, { retries = 2 } = {}) {
  let last;
  for (let i = 0; i <= retries; i++) {
    const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 25000);
    try {
      const r = await fetch(url, { headers: HEADERS, signal: ac.signal });
      clearTimeout(t);
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) { clearTimeout(t); last = e; if (i < retries) await wait(1500 * (i + 1)); }
  }
  throw new Error(`fetch failed: ${url} (${last && last.message})`);
}

// ---------- data.js 읽기 ----------
function loadHub() {
  const src = fs.readFileSync(path.join(ROOT, "data.js"), "utf8");
  return new Function("window", src + "; return window.HUB;")({});
}
function loadExisting(id) {
  const p = path.join(OUT_DIR, `${id}.js`);
  if (!fs.existsSync(p)) return null;
  try {
    const src = fs.readFileSync(p, "utf8");
    const w = { HUB_MATCHES: {} };
    new Function("window", src)(w);
    return w.HUB_MATCHES[id] || null;
  } catch { return null; }
}

// ---------- BBC → 스키마 변환 ----------
const POS = (p) => /goalkeeper/i.test(p) ? "GK" : /defender|back/i.test(p) ? "DF" : /midfield/i.test(p) ? "MF" : /striker|forward|winger/i.test(p) ? "FW" : /substitute/i.test(p) ? "SUB" : "SUB";
const stat = (pl, field) => { const s = (pl.stats || []).find(x => x.dataField === field); return s ? Number(s.statValue) || 0 : 0; };
const cardType = (c) => /second/i.test(c.type) ? "YR" : /red/i.test(c.type) ? "R" : "Y";
const minOf = (lbl) => lbl && lbl.value ? lbl.value : (typeof lbl === "string" ? lbl : "");
function minKey(m) { // "90'+3" → 90.03, "45'" → 45
  const x = String(m || "").match(/(\d+)(?:'?\s*\+\s*(\d+))?/); if (!x) return 999;
  return Number(x[1]) + (x[2] ? Number(x[2]) / 100 : 0);
}

function convertPlayer(pl, subEvents, nameById) {
  const out = {
    n: pl.shirtNumber ?? null,
    name: (pl.name && (pl.name.shirt || pl.name.short)) || pl.displayName || "",
    pos: POS(pl.position || ""),
    captain: !!pl.isCaptain,
    goals: stat(pl, "goals"), assists: stat(pl, "assists"), mins: stat(pl, "minsPlayed"),
    cards: (pl.cards || []).map(c => ({ type: cardType(c), min: minOf(c.timeLabel) })),
  };
  // BBC는 교체 이벤트를 나간 선수 쪽에만 붙이므로, 팀 전체 이벤트에서 urn으로 찾는다
  for (const s of subEvents) {
    if (s.outId === pl.urn) out.off = { min: s.min, by: nameById[s.inId] || s.inName || "" };
    if (s.inId === pl.urn) out.on = { min: s.min, for: nameById[s.outId] || "" };
  }
  return out;
}

function convertTeam(t, fixtureSide) {
  const base = { key: fixtureSide.key, name: fixtureSide.name, short: fixtureSide.short, code: null, score: null, manager: null, formation: null, rows: [], starters: [], subs: [] };
  if (!t) return base;
  base.code = (t.name && t.name.code) || null;
  base.manager = (t.manager && t.manager.name && t.manager.name.full) || null;
  const starters = (t.players && t.players.starters) || [];
  const subs = (t.players && t.players.substitutes) || [];
  const nameById = {}, subEvents = [], seen = new Set();
  for (const p of [...starters, ...subs]) {
    nameById[p.urn] = (p.name && (p.name.shirt || p.name.short)) || p.displayName || "";
    for (const s of p.substitutes || []) {
      const key = `${s.playerSubbedOutId}>${s.playerSubbedInId}`;
      if (seen.has(key)) continue; seen.add(key);
      subEvents.push({ outId: s.playerSubbedOutId, inId: s.playerSubbedInId, inName: s.playerSubbedInName || "", min: minOf(s.timeLabel) });
    }
  }
  base.formation = t.formation && t.formation.value ? t.formation.value.replace(/\s/g, "") : null;
  base.rows = (t.pitchLayout || []).map(row => row.map(p => Number(p.shirtNumber)).filter(n => !isNaN(n)));
  base.starters = starters.map(p => convertPlayer(p, subEvents, nameById));
  base.subs = subs.map(p => convertPlayer(p, subEvents, nameById));
  return base;
}

function num(v) { if (v == null) return null; const n = Number(typeof v === "object" ? v.total : v); return isNaN(n) ? null : n; }
function convertStats(st) {
  if (!st || !st.homeTeam || !st.awayTeam) return null;
  const h = st.homeTeam.stats || {}, a = st.awayTeam.stats || {};
  const pair = (f) => [f(h), f(a)];
  const out = {
    possession: pair(s => num(s.possessionPercentage)),
    shots: pair(s => num(s.shotsTotal)),
    onTarget: pair(s => num(s.shotsOnTarget)),
    corners: pair(s => num(s.cornersWon)),
    fouls: pair(s => num(s.foulsCommitted)),
    xg: pair(s => { const v = s.expected && num(s.expected.goals); return v == null ? null : Math.round(v * 100) / 100; }),
    saves: pair(s => num(s.shotsSaved)),
    passes: pair(s => s.distribution && num(s.distribution.totalPass)),
    passAcc: pair(s => s.distribution && num(s.distribution.accuratePassPercentage)),
    offsides: pair(s => s.attack && num(s.attack.offsides)),
  };
  for (const k of Object.keys(out)) if (out[k][0] == null && out[k][1] == null) delete out[k];
  return Object.keys(out).length ? out : null;
}

function goalsOf(fixture) {
  const out = [];
  for (const side of ["home", "away"]) for (const s of (fixture.scorers && fixture.scorers[side]) || []) {
    const types = Array.isArray(s.types) ? s.types : null;
    (s.times || []).forEach((min, i) => {
      const raw = types ? types[i] : s.type;
      const type = /own/i.test(raw || "") ? "og" : /pen/i.test(raw || "") ? "pen" : "goal";
      out.push({ side, player: s.name, min, type });
    });
  }
  return out.sort((x, y) => minKey(x.min) - minKey(y.min));
}

function buildTimeline(match) {
  const ev = [];
  for (const g of match.goals) ev.push({ min: g.min, side: g.side, type: g.type, player: g.player });
  for (const side of ["home", "away"]) {
    const t = match[side];
    for (const p of [...t.starters, ...t.subs]) {
      for (const c of p.cards) ev.push({ min: c.min, side, type: c.type, player: p.name });
      if (p.on) ev.push({ min: p.on.min, side, type: "sub", player: p.name, extra: p.on.for });
    }
  }
  return ev.sort((x, y) => minKey(x.min) - minKey(y.min));
}

// ---------- 메인 ----------
async function main() {
  const HUB = loadHub();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const now = Date.now();
  const inWindow = (f) => {
    if (!f.kickoff) return false;
    const k = new Date(f.kickoff).getTime();
    return now >= k - PRE_MIN * 60000 && now <= k + POST_HOURS * 3600000;
  };
  const wanted = HUB.fixtures.filter(f => (f.comp === "PL" || f.mu) && f.status !== "postponed").filter(f => {
    if (OPT_IDS.length) return OPT_IDS.includes(f.id);
    if (OPT_ALL) return f.status === "post" || inWindow(f);
    if (inWindow(f)) return true;
    if (f.status === "post") { const ex = loadExisting(f.id); return !(ex && ex.final); }
    return false;
  });
  log(`대상 경기 ${wanted.length}개 (전체 ${HUB.fixtures.length})`);

  let written = 0, skipped = 0;
  for (const f of wanted) {
    const urn = encodeURIComponent(`urn:bbc:sportsdata:football:event:${f.id}`);
    let lu = null, st = null;
    try {
      lu = await fetchJson(`https://www.bbc.com/wc-data/container/match-lineups?formationGraphicVisible=true&globalContainerPolling=true&urn=${urn}`);
      await wait(300);
      st = await fetchJson(`https://www.bbc.com/wc-data/container/match-stats?globalContainerPolling=true&isConstrained=true&urn=${urn}`);
      await wait(300);
    } catch (e) { log(`  ✗ ${f.home.short} v ${f.away.short}: ${e.message}`); continue; }

    const hasLineups = !!(lu && lu.homeTeam && lu.homeTeam.players && lu.homeTeam.players.starters && lu.homeTeam.players.starters.length);
    if (!hasLineups && f.status === "pre") { skipped++; continue; }   // 발표 전 — 파일 없음 = "아직 없음"

    const match = {
      id: f.id, updatedAt: kstNow(),
      status: f.status, statusText: f.statusText, final: f.status === "post",
      kickoff: f.kickoff, comp: f.comp, compName: f.compName,
      lineups: hasLineups,
      home: convertTeam(hasLineups ? lu.homeTeam : null, f.home),
      away: convertTeam(hasLineups ? lu.awayTeam : null, f.away),
      goals: goalsOf(f), timeline: [],
      stats: convertStats(st),
      officials: { referee: (() => { const r = (lu && lu.officials || []).find(o => /^Referee$/i.test(o.type)); return r ? `${r.firstName} ${r.lastName}`.trim() : null; })() },
    };
    match.home.score = f.score ? f.score.home : null;
    match.away.score = f.score ? f.score.away : null;
    match.timeline = buildTimeline(match);

    const body = `// 경기 상세 — scripts/update-matches.mjs 생성 (${match.updatedAt}). 구조: SCHEMA.md 4절\n` +
      `window.HUB_MATCHES = window.HUB_MATCHES || {};\n` +
      `window.HUB_MATCHES[${JSON.stringify(f.id)}] = ${JSON.stringify(match)};\n`;
    const p = path.join(OUT_DIR, `${f.id}.js`);
    const prev = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
    const strip = (s) => s.replace(/"updatedAt":"[^"]*"/, "").replace(/생성 \([^)]*\)/, "");
    if (strip(prev) === strip(body)) { skipped++; continue; }   // 내용 동일 → 시각만 바뀐 경우는 쓰지 않음
    fs.writeFileSync(p, body, "utf8");
    written++;
    log(`  ✓ ${f.dateUK} ${f.home.short} ${f.score ? f.score.home + "-" + f.score.away : "v"} ${f.away.short} · 라인업 ${hasLineups ? "O" : "X"} · 통계 ${match.stats ? "O" : "X"} · ${f.status}`);
  }

  // 인덱스 재생성
  const index = {};
  for (const name of fs.readdirSync(OUT_DIR)) {
    if (!name.endsWith(".js") || name === "index.js") continue;
    const id = name.slice(0, -3); const m = loadExisting(id); if (!m) continue;
    index[id] = { status: m.status, lineups: !!m.lineups, final: !!m.final, updatedAt: m.updatedAt };
  }
  const idxBody = `// 경기 상세 파일 목록 — scripts/update-matches.mjs 생성. 구조: SCHEMA.md 4절\nwindow.HUB_MATCH_INDEX = ${JSON.stringify(index)};\n`;
  const idxPath = path.join(OUT_DIR, "index.js");
  const prevIdx = fs.existsSync(idxPath) ? fs.readFileSync(idxPath, "utf8") : "";
  if (prevIdx !== idxBody) fs.writeFileSync(idxPath, idxBody, "utf8");
  log(`완료: 새로 씀 ${written}, 변경 없음/발표 전 ${skipped}, 인덱스 ${Object.keys(index).length}개`);
}

main().catch(e => { console.error("실패:", e.message); process.exit(1); });
