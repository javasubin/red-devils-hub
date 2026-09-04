#!/usr/bin/env node
// ============================================================
//  update-data.mjs — BBC Sport 페이지를 읽어 data.js(window.HUB)를 다시 씁니다.
//  Node 22+ (내장 fetch). 외부 패키지 없음.  실행: node scripts/update-data.mjs
//  - PL 380경기 + 맨유 전 대회 경기 (wc-data JSON, 실패 시 HTML 월 페이지 폴백)
//  - 순위표 / 득점 순위 / 20팀 배지 URL
//  - 매치위크(1~38) 도출, currentMw 계산
//  실패하면 기존 data.js를 건드리지 않고 종료 코드 1로 끝납니다.
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data.js");

const CFG = {
  season: "2026-27",
  team: "manchester-united",                                   // 기본(초기 선택) 팀
  teams: ["manchester-united", "tottenham-hotspur"],           // 지원 팀 — 컵·유럽 경기까지 수집하고 화면에서 선택 가능
  plUrn: "urn:bbc:sportsdata:football:tournament:premier-league",
  plRange: ["2026-08-01", "2027-05-31"],   // PL 경기 수집 범위
  teamRange: ["2026-07-01", "2027-06-30"], // 맨유 전 대회 수집 범위 (친선전·컵 결승 포함)
  matchweeks: 38,
};

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const HEADERS = { "user-agent": UA, "accept-language": "en-GB,en;q=0.9" };

// ---------- 유틸 ----------
function log(...a) { console.log(new Date().toISOString().slice(11, 19), ...a); }
function pad(n) { return String(n).padStart(2, "0"); }
function kstNow() {
  const s = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Seoul" }); // "2026-09-03 17:45:12"
  return s.replace(" ", "T") + "+09:00";
}
function ukToday() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/London" });
}
function slugOf(urn) { return urn ? urn.split(":").pop() : null; }
function monthsBetween(from, to) {
  const out = [];
  let [y, m] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
    out.push({ start: `${y}-${pad(m)}-01`, end: `${y}-${pad(m)}-${pad(last)}` });
    m++; if (m > 12) { m = 1; y++; }
  }
  return out;
}

async function fetchText(url, { retries = 2, timeoutMs = 25000, accept } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const r = await fetch(url, { headers: { ...HEADERS, ...(accept ? { accept } : {}) }, signal: ac.signal });
      clearTimeout(t);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.text();
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      if (i < retries) await new Promise(r => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw new Error(`fetch failed: ${url} (${lastErr && lastErr.message})`);
}

// BBC 페이지에 박힌 window.__INITIAL_DATA__ 파싱
function initialData(html) {
  // window.__INITIAL_DATA__="{...}" — JS 문자열 리터럴을 먼저 풀고(JSON.parse 1회) 그 결과를 JSON으로 다시 파싱
  const m = html.match(/window\.__INITIAL_DATA__=("(?:[^"\\]|\\.)*");/s);
  if (!m) return null;
  return JSON.parse(JSON.parse(m[1]));
}
function pickContainer(data, re) {
  const k = Object.keys(data.data || {}).find(k => re.test(k));
  return k ? data.data[k] : null;
}

// ---------- 경기 수집 ----------
async function fetchEventsRange(urn, start, end) {
  const today = ukToday();
  const q = new URLSearchParams({ selectedEndDate: end, selectedStartDate: start, todayDate: today, urn });
  const url = `https://www.bbc.com/wc-data/container/sport-data-scores-fixtures?${q}`;
  try {
    const txt = await fetchText(url, { accept: "application/json" });
    const j = JSON.parse(txt);
    if (!j.eventGroups) throw new Error("no eventGroups");
    return flattenGroups(j.eventGroups);
  } catch (e) {
    // 폴백: HTML 월 페이지 (당월이면 내일부터만 보이는 한계가 있음)
    const ym = start.slice(0, 7);
    const page = urn.includes(":team:")
      ? `https://www.bbc.com/sport/football/teams/${slugOf(urn)}/scores-fixtures/${ym}`
      : `https://www.bbc.com/sport/football/premier-league/scores-fixtures/${ym}`;
    log(`  wc-data 실패 (${e.message}) → HTML 폴백 ${page}`);
    const html = await fetchText(page);
    const d = initialData(html);
    const c = d && pickContainer(d, /^sport-data-scores-fixtures/);
    if (!c) throw new Error(`HTML 폴백도 실패: ${page}`);
    return flattenGroups(c.data.eventGroups);
  }
}
function flattenGroups(groups) {
  const out = [];
  for (const g of groups || []) for (const sg of g.secondaryGroups || []) for (const e of sg.events || []) out.push(e);
  return out;
}

const COMP = [
  [/^Premier League$/i, "PL"],
  [/Champions League/i, "UCL"],
  [/Europa League/i, "UEL"],
  [/Conference League/i, "UECL"],
  [/^FA Cup$/i, "FAC"],
  [/League Cup|EFL Cup|Carabao/i, "EFL"],
  [/Community Shield/i, "CS"],
  [/Friendl/i, "FR"],
  [/Club World Cup/i, "CWC"],
  [/Super Cup/i, "USC"],
];
function compCode(name) {
  for (const [re, code] of COMP) if (re.test(name || "")) return code;
  return "OTHER";
}
function roundOf(e) {
  // "Europe - UEFA Champions League - League Stage" → "League Stage"; "England - Premier League" → null
  const lbl = e.eventGroupingLabel || "";
  const parts = lbl.split(" - ").map(s => s.trim());
  if (parts.length <= 2) return null;
  return parts.slice(2).join(" - ");
}
function sideOf(t) {
  return { key: slugOf(t.urn), name: t.fullName || (t.name && t.name.fullName) || "", short: t.shortName || (t.name && t.name.shortName) || "" };
}
function scorersOf(t) {
  const out = [];
  const kind = (s) => /own/i.test(s || "") ? "og" : /pen/i.test(s || "") ? "pen" : "goal";
  for (const a of t.actions || []) {
    const acts = (a.actions || []).filter(x => x.timeLabel && x.timeLabel.value);
    const times = acts.map(x => x.timeLabel.value);
    const types = acts.map(x => kind(x.type));           // 골마다 "goal" | "pen" | "og" (times와 같은 순서)
    out.push({ name: a.playerName, times, types, type: types[0] || "goal" });
  }
  return out;
}
function normalizeEvent(e) {
  const compName = (e.tournament && e.tournament.name) || "";
  const comp = compCode(compName);
  const sc = (e.statusComment && e.statusComment.value) || (e.periodLabel && e.periodLabel.value) || "";
  let status = e.status === "PostEvent" ? "post" : e.status === "PreEvent" ? "pre" : "live";
  if (/postpone|abandon|cancel/i.test(sc)) status = "postponed";
  const hasScore = e.home && e.home.score != null && e.away && e.away.score != null;
  const score = hasScore ? { home: parseInt(e.home.score, 10), away: parseInt(e.away.score, 10) } : null;
  let winner = null;
  if (status === "post" && score) winner = e.winner === "home" || e.winner === "away" ? e.winner : (score.home === score.away ? "draw" : (score.home > score.away ? "home" : "away"));
  const home = sideOf(e.home), away = sideOf(e.away);
  return {
    id: e.id,
    comp, compName,
    round: comp === "PL" ? null : roundOf(e),
    mw: null,
    kickoff: e.startDateTime || (e.date && e.date.iso) || null,
    dateUK: (e.date && e.date.isoDate) || null,
    timeUK: (e.time && e.time.displayTimeUK) || (e.date && e.date.time) || null,
    home, away,
    status, statusText: sc || (status === "pre" ? "Scheduled" : ""),
    score, winner,
    scorers: { home: scorersOf(e.home), away: scorersOf(e.away) },
    mu: home.key === CFG.team || away.key === CFG.team,                       // 기본 팀 경기 여부 (하위 호환)
    fav: CFG.teams.filter(t => t === home.key || t === away.key),              // 이 경기에 뛰는 지원 팀 키 목록
    url: e.onwardJourneyLink ? `https://www.bbc.com${e.onwardJourneyLink}` : null,
  };
}

// 매치위크 도출: 날짜순으로 보며 두 팀 모두 비어 있는 가장 이른 라운드에 배정
function assignMatchweeks(fixtures) {
  const pl = fixtures.filter(f => f.comp === "PL").sort((a, b) => (a.kickoff || "").localeCompare(b.kickoff || "") || a.id.localeCompare(b.id));
  const used = new Map(); // team -> Set(mw)
  const has = (t, mw) => used.has(t) && used.get(t).has(mw);
  for (const f of pl) {
    let mw = 1;
    while (has(f.home.key, mw) || has(f.away.key, mw)) mw++;
    f.mw = mw;
    for (const t of [f.home.key, f.away.key]) { if (!used.has(t)) used.set(t, new Set()); used.get(t).add(mw); }
  }
  const maxMw = pl.reduce((m, f) => Math.max(m, f.mw || 0), 0);
  if (maxMw > CFG.matchweeks) log(`  ⚠ 매치위크가 ${maxMw}까지 나왔습니다 (일정 중복/누락 가능성)`);
  const open = pl.filter(f => f.status !== "post").map(f => f.mw);
  const currentMw = open.length ? Math.min(...open) : (maxMw || CFG.matchweeks);
  return { plCount: pl.length, maxMw, currentMw };
}

// ---------- 순위표 · 팀 · 득점 ----------
async function fetchTable() {
  const html = await fetchText("https://www.bbc.com/sport/football/premier-league/table");
  const d = initialData(html);
  const c = d && pickContainer(d, /^football-table/);
  if (!c) throw new Error("순위표 컨테이너를 찾지 못함");
  const rounds = c.data.tournaments[0].stages[0].rounds[0];
  const parts = rounds.participants || [];
  const badges = {};
  for (const m of html.matchAll(/data-testid="badge-img-([a-z0-9-]+)"[^>]*?src="([^"]+)"/g)) badges[m[1]] = m[2];
  for (const m of html.matchAll(/src="([^"]+)"[^>]*?data-testid="badge-img-([a-z0-9-]+)"/g)) badges[m[2]] = badges[m[2]] || m[1];
  const standings = parts.map(p => ({
    rank: p.rank, key: slugOf(p.urn), name: p.name, short: p.shortName,
    played: p.matchesPlayed, won: p.wins, drawn: p.draws, lost: p.losses,
    gf: p.goalsScoredFor, ga: p.goalsScoredAgainst, gd: p.goalDifference, points: p.points,
    form: (p.formGuide || []).map(x => x.value === "W" || x.value === "D" || x.value === "L" ? x.value : "-"),
    zone: p.rankStatus || "",
    rankPrev: p.rankPrevious ?? null,
  }));
  const teams = {};
  for (const s of standings) teams[s.key] = { name: s.name, short: s.short, badge: badges[s.key] || null };
  return { standings, teams };
}
async function fetchScorers() {
  const html = await fetchText("https://www.bbc.com/sport/football/premier-league/top-scorers");
  const d = initialData(html);
  const c = d && pickContainer(d, /^football-top-scorers/);
  if (!c) throw new Error("득점 순위 컨테이너를 찾지 못함");
  return (c.data.topScorers || []).map(s => ({
    rank: s.rank, name: s.fullName, team: slugOf(s.teamsSummary && s.teamsSummary.badgeUrn), teamShort: (s.teamsSummary && s.teamsSummary.shortNames) || "",
    goals: s.goals ?? 0, assists: s.assists ?? 0, played: s.played ?? 0, minutes: s.totalMinsPlayed ?? 0, shots: s.totalShots ?? 0,
  }));
}

// ---------- 메인 ----------
async function main() {
  const t0 = Date.now();
  log(`RED DEVILS HUB 데이터 갱신 시작 — 시즌 ${CFG.season}, 지원 팀 ${CFG.teams.join(", ")} (기본 ${CFG.team})`);

  const byId = new Map();
  const add = (list) => { let n = 0; for (const e of list) { if (!byId.has(e.id)) { byId.set(e.id, normalizeEvent(e)); n++; } } return n; };

  for (const m of monthsBetween(CFG.plRange[0], CFG.plRange[1])) {
    const evs = await fetchEventsRange(CFG.plUrn, m.start, m.end);
    log(`PL ${m.start.slice(0, 7)}: ${evs.length}경기 (신규 ${add(evs)})`);
  }
  for (const team of CFG.teams) {
    const urn = `urn:bbc:sportsdata:football:team:${team}`;
    let n = 0, fresh = 0;
    for (const m of monthsBetween(CFG.teamRange[0], CFG.teamRange[1])) {
      const evs = await fetchEventsRange(urn, m.start, m.end);
      n += evs.length; fresh += add(evs);
    }
    log(`${team}: 전 대회 ${n}경기 (PL 외 신규 ${fresh})`);
  }
  const fixtures = [...byId.values()].sort((a, b) => (a.kickoff || "").localeCompare(b.kickoff || "") || a.id.localeCompare(b.id));
  const mwInfo = assignMatchweeks(fixtures);
  log(`경기 합계 ${fixtures.length} (PL ${mwInfo.plCount}, 지원 팀 경기 ${fixtures.filter(f => f.fav.length).length}), 매치위크 최대 ${mwInfo.maxMw}, 현재 MW ${mwInfo.currentMw}`);
  if (mwInfo.plCount < 300) throw new Error(`PL 경기 수가 비정상적으로 적습니다: ${mwInfo.plCount}`);

  const { standings, teams } = await fetchTable();
  log(`순위표 ${standings.length}팀, 배지 ${Object.values(teams).filter(t => t.badge).length}개`);
  if (standings.length !== 20) throw new Error(`순위표 팀 수 이상: ${standings.length}`);
  const scorers = await fetchScorers();
  log(`득점 순위 ${scorers.length}명`);

  const HUB = {
    meta: {
      updatedAt: kstNow(), season: CFG.season,
      seasonStart: CFG.plRange[0], seasonEnd: CFG.plRange[1],
      team: CFG.team, teams: CFG.teams, matchweeks: CFG.matchweeks, source: "BBC Sport",
      currentMw: mwInfo.currentMw,
    },
    teams, fixtures, standings, scorers,
  };

  const header = `// ============================================================
//  RED DEVILS HUB 데이터 — scripts/update-data.mjs 가 BBC Sport에서 생성합니다. 손으로 고치지 마세요.
//  경기 ${fixtures.length} · 순위표 ${standings.length}팀 · 득점 ${scorers.length}명 (생성 시각은 meta.updatedAt)
//  구조: SCHEMA.md
// ============================================================
`;
  const body = header + "window.HUB = " + JSON.stringify(HUB, null, 1) + ";\n";

  // 검증 후 원자적 교체
  const tmp = OUT + ".tmp";
  fs.writeFileSync(tmp, body, "utf8");
  const check = new Function("window", fs.readFileSync(tmp, "utf8") + "; return window.HUB;")({});
  if (!check || check.fixtures.length !== fixtures.length) throw new Error("생성 파일 자체 검증 실패");
  fs.renameSync(tmp, OUT);
  log(`data.js 저장 완료 (${(body.length / 1024).toFixed(0)} KB, ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

main().catch(e => { console.error("실패:", e.message); process.exit(1); });
