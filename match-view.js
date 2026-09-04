/* match-view.js — 경기 상세(라인업 · 타임라인 · 팀 기록) 공용 모듈
   index.html · club.html 둘 다 이 파일을 읽는다. 빌드 없음, file:// 에서도 동작.

   window.HUB_MATCHVIEW = {
     init(cb)                      matches/index.js 를 한 번만 읽는다 (없으면 {})
     load(id, cb)                  matches/<id>.js 를 읽어 cb(match|null)
     render(el, fixture, match, o) 경기 상세 패널을 그린다
   }
   o.mode      'full'(기본) | 'lineups'  — 'lineups'면 라인업 블록만
   o.header    false면 헤더(배지·스코어·상태) 생략
   o.lineupsOpen  라인업을 펼친 상태로 시작할지 (기본: mode==='lineups'일 때만 true)
*/
window.HUB_MATCHVIEW = (function () {
  'use strict';

  /* ---------------- 로더 ---------------- */
  var idxState = 0;          // 0 시작 전 · 1 로딩 중 · 2 완료
  var idxQueue = [];
  var pending = {};          // id -> 대기 중인 콜백들 (더블 클릭해도 한 번만 읽는다)
  var failed = {};           // 파일이 없던 id

  function idx() { return window.HUB_MATCH_INDEX || {}; }
  function cached() { return window.HUB_MATCHES || {}; }
  function fire(cb, a) { try { cb(a); } catch (e) { if (window.console) console.error('[match-view]', e); } }

  function inject(src, done) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = s.onerror = function () { s.onload = s.onerror = null; done(); };
    (document.head || document.documentElement).appendChild(s);
  }

  function init(cb) {
    if (idxState === 2) { if (cb) fire(cb, idx()); return; }
    if (cb) idxQueue.push(cb);
    if (idxState === 1) return;
    idxState = 1;
    inject('matches/index.js', function () {
      idxState = 2;
      window.HUB_MATCH_INDEX = window.HUB_MATCH_INDEX || {};
      var q = idxQueue; idxQueue = [];
      for (var i = 0; i < q.length; i++) fire(q[i], idx());
    });
  }

  function load(id, cb) {
    cb = cb || function () {};
    if (!id) { fire(cb, null); return; }
    if (cached()[id]) { fire(cb, cached()[id]); return; }
    if (failed[id]) { fire(cb, null); return; }
    if (pending[id]) { pending[id].push(cb); return; }
    pending[id] = [cb];
    inject('matches/' + encodeURIComponent(id) + '.js', function () {
      var m = cached()[id] || null;
      if (!m) failed[id] = true;
      var q = pending[id] || []; delete pending[id];
      for (var i = 0; i < q.length; i++) fire(q[i], m);
    });
  }

  /* ---------------- 유틸 ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function HUB() { return window.HUB || {}; }
  function TEAMS() { return HUB().teams || {}; }
  function CLUBS() { return window.HUB_CLUBS || {}; }
  function MUKEY() { return (HUB().meta && HUB().meta.team) || 'manchester-united'; }
  var DOW = ['일', '월', '화', '수', '목', '금', '토'];
  var COMP_KO = { PL: '프리미어리그', UCL: '챔피언스리그', UEL: '유로파리그', UECL: '컨퍼런스리그', FAC: 'FA컵', EFL: '리그컵(카라바오컵)', FR: '친선경기', OTHER: '기타' };
  var COMP_TAG = { PL: 'PL', UCL: 'UCL', UEL: 'UEL', UECL: 'UECL', FAC: 'FA컵', EFL: '리그컵', FR: '친선', OTHER: '기타' };
  function compTag(c) { var k = COMP_TAG[c] ? c : 'OTHER'; return '<span class="ctag ' + k.toLowerCase() + '">' + esc(COMP_TAG[c] || c || 'ETC') + '</span>'; }

  function club(key) { return (key && CLUBS()[key]) || {}; }
  function koName(key, fallback) { var c = club(key); return c.ko || (TEAMS()[key] && TEAMS()[key].name) || fallback || key || '?'; }
  function abbrOf(key, side) {
    var c = club(key);
    if (c.abbr) return String(c.abbr).toUpperCase();
    var base = String((side && (side.code || side.short || side.name)) || (TEAMS()[key] && TEAMS()[key].short) || key || '?');
    var w = base.replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean);
    if (w.length >= 2) return (w[0][0] + w[1].slice(0, 2)).toUpperCase();
    return (w[0] || base).slice(0, 3).toUpperCase();
  }
  function badge(key, size, side) {
    var t = TEAMS()[key] || {}, s = size || 22, col = club(key).color || '#8a8a94';
    var h = '<span class="bdg' + (t.badge ? '' : ' nb') + '" style="width:' + s + 'px;height:' + s + 'px;--bs:' + s + 'px;--bc:' + esc(col) + '">';
    if (t.badge) h += '<img src="' + esc(t.badge) + '" alt="" loading="lazy" onerror="this.parentNode.classList.add(&quot;nb&quot;);this.remove();">';
    return h + '<i>' + esc(abbrOf(key, side)) + '</i></span>';
  }

  // 팀 색을 바·유니폼에 쓰되, 배경과 붙는 색(흰색·남색)은 읽히게 보정한다
  var DARK = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  function hex2rgb(h) {
    h = String(h || '').trim().replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lum(c) {
    var a = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function mix(c, t, r) { return c.map(function (v, i) { return Math.round(v + (t[i] - v) * r); }); }
  function teamColor(key) {
    var rgb = hex2rgb(club(key).color);
    if (!rgb) return DARK ? '#5a5a66' : '#6b6b78';
    var L = lum(rgb);
    if (DARK && L < 0.14) rgb = mix(rgb, [255, 255, 255], 0.42);
    else if (!DARK && L > 0.62) rgb = mix(rgb, [0, 0, 0], 0.42);
    return 'rgb(' + rgb.join(',') + ')';
  }

  // "Bruno Fernandes" → "B. Fernandes" (피치 칩처럼 좁은 자리용. 원래 이름은 title 로 남긴다)
  function shortName(n) {
    var s = String(n == null ? '' : n).trim();
    if (!s) return '';
    var p = s.split(/\s+/);
    if (p.length < 2 || /^[A-Za-z]\.$/.test(p[0])) return s;
    return p[0].charAt(0).toUpperCase() + '. ' + p.slice(1).join(' ');
  }
  // "90'+3" → 90.03 (추가시간이 뒤에 오도록)
  function minVal(m) {
    var a = String(m == null ? '' : m).match(/\d+/g);
    if (!a) return 0;
    return (parseInt(a[0], 10) || 0) + (a.length > 1 ? (parseInt(a[1], 10) || 0) / 100 : 0);
  }
  function localTime(v) { var d = new Date(v); return isNaN(d.getTime()) ? null : d; }
  function ukTime(fx, m) {
    if (fx && fx.timeUK) return fx.timeUK;
    var d = localTime((fx && fx.kickoff) || (m && m.kickoff));
    if (!d) return '';
    try { return d.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return ''; }
  }

  /* ---------------- 헤더 ---------------- */
  function sideOf(m, fx, side) {
    var a = (m && m[side]) || {}, b = (fx && fx[side]) || {};
    return { key: a.key || b.key, name: a.name || b.name, short: a.short || b.short, code: a.code, score: a.score };
  }
  function scorePair(m, fx) {
    var h = m && m.home && typeof m.home.score === 'number' ? m.home.score : null;
    var a = m && m.away && typeof m.away.score === 'number' ? m.away.score : null;
    if (h == null || a == null) {
      if (fx && fx.score) { h = fx.score.home; a = fx.score.away; }
    }
    return (h == null || a == null) ? null : { home: h, away: a };
  }

  function headerHtml(fx, m, id) {
    var hm = sideOf(m, fx, 'home'), aw = sideOf(m, fx, 'away');
    var status = (m && m.status) || (fx && fx.status) || 'pre';
    var stText = (m && m.statusText) || (fx && fx.statusText) || '';
    var sc = scorePair(m, fx);
    var k = localTime((fx && fx.kickoff) || (m && m.kickoff));
    var mu = MUKEY();
    var comp = (fx && fx.comp) || (m && m.comp) || 'OTHER';
    var round = (fx && fx.round) || null, mw = (fx && fx.mw) || null;

    var mid;
    if (status === 'postponed') mid = '<div class="mv-sc t">연기</div>';
    else if (sc) mid = '<div class="mv-sc">' + sc.home + ' <span style="opacity:.4">–</span> ' + sc.away + '</div>';
    else mid = '<div class="mv-sc t">' + (k ? pad(k.getHours()) + ':' + pad(k.getMinutes()) : 'vs') + '</div>';

    var badgeTxt = status === 'live' ? '<span class="mv-stt live">LIVE</span>'
      : status === 'post' ? '<span class="mv-stt ft">' + esc(stText || 'FT') + '</span>'
        : status === 'postponed' ? '<span class="mv-stt">연기</span>'
          : '<span class="mv-stt">예정</span>';

    var h = '<div class="mv-hd">' +
      '<div class="mv-tm h' + (hm.key === mu ? ' mu' : '') + '"><span class="nm">' + esc(koName(hm.key, hm.name || hm.short)) + '</span>' + badge(hm.key, 26, hm) + '</div>' +
      '<div class="mv-mid">' + mid + badgeTxt + '</div>' +
      '<div class="mv-tm' + (aw.key === mu ? ' mu' : '') + '">' + badge(aw.key, 26, aw) + '<span class="nm">' + esc(koName(aw.key, aw.name || aw.short)) + '</span></div>' +
      '</div>';

    var uk = ukTime(fx, m);
    h += '<div class="mv-meta">' + compTag(comp) +
      (mw ? '<span class="kv">MW ' + esc(mw) + '</span>' : (round ? '<span class="kv">' + esc(round) + '</span>' : '')) +
      (k ? '<span class="kv">' + (k.getMonth() + 1) + '월 ' + k.getDate() + '일 (' + DOW[k.getDay()] + ') <b>' + pad(k.getHours()) + ':' + pad(k.getMinutes()) + '</b>' + (uk ? ' (현지 ' + esc(uk) + ')' : '') + '</span>' : '') +
      (m && m.officials && m.officials.referee ? '<span class="kv">주심 <b>' + esc(m.officials.referee) + '</b></span>' : '') +
      (fx && fx.url ? '<a class="mv-bbc" href="' + esc(fx.url) + '" target="_blank" rel="noopener">BBC ↗</a>' : '') +
      '</div>';
    return h;
  }

  /* ---------------- 타임라인 ---------------- */
  function timelineOf(m) {
    var out = [];
    if (m && m.timeline && m.timeline.length) {
      out = m.timeline.slice();
    } else if (m) {
      (m.goals || []).forEach(function (g) { out.push({ min: g.min, side: g.side, type: g.type || 'goal', player: g.player }); });
      ['home', 'away'].forEach(function (side) {
        var t = m[side] || {};
        (t.starters || []).concat(t.subs || []).forEach(function (p) {
          (p.cards || []).forEach(function (c) { out.push({ min: c.min, side: side, type: c.type, player: p.name }); });
          if (p.off) out.push({ min: p.off.min, side: side, type: 'sub', player: p.off.by, extra: p.name });
          if (p.on) out.push({ min: p.on.min, side: side, type: 'sub', player: p.name, extra: p.on.for });
        });
      });
      var seen = {};
      out = out.filter(function (e) {
        var k = [e.type, e.side, e.min, e.player].join('|');
        if (seen[k]) return false;
        seen[k] = 1; return true;
      });
    }
    return out.sort(function (a, b) { return minVal(a.min) - minVal(b.min); });
  }

  function cardIcon(type) {
    var t = String(type || '').toUpperCase();
    if (t === 'R') return '<i class="mv-cd r"></i>';
    if (t === 'YR') return '<span class="mv-cd2"><i class="mv-cd y"></i><i class="mv-cd r"></i></span>';
    return '<i class="mv-cd y"></i>';
  }

  function evParts(e) {
    var t = String(e.type || '').toLowerCase();
    if (t === 'goal' || t === 'pen' || t === 'og' || t === 'penalty' || t === 'own') {
      return { cls: 'goal', ic: '⚽', tag: (t === 'pen' || t === 'penalty') ? 'PK' : ((t === 'og' || t === 'own') ? 'OG' : ''), ex: '' };
    }
    if (t === 'sub') return { cls: 'sub', ic: '<span class="mv-in">↑</span>', tag: '', ex: e.extra ? '<span class="mv-out">↓</span> ' + esc(e.extra) : '' };
    return { cls: 'card', ic: cardIcon(e.type), tag: String(e.type).toUpperCase() === 'YR' ? '경고 누적' : '', ex: '' };
  }

  function tlHtml(list, m) {
    var mu = MUKEY();
    var h = '<ul class="mv-tl">';
    list.forEach(function (e) {
      var side = e.side === 'away' ? 'away' : 'home';
      var isMu = ((m && m[side] && m[side].key) || '') === mu;
      var p = evParts(e);
      var name = '<span class="pl" title="' + esc(e.player) + '">' + esc(e.player) + '</span>';
      var tag = p.tag ? '<span class="mv-tag">' + esc(p.tag) + '</span>' : '';
      var ex = p.ex ? '<span class="ex">' + p.ex + '</span>' : '';
      var ic = '<span class="ic">' + p.ic + '</span>';
      var cell = side === 'home'
        ? '<div class="s h">' + ex + tag + name + ic + '</div>'
        : '<div class="s">' + ic + name + tag + ex + '</div>';
      h += '<li class="mv-ev ' + p.cls + (isMu ? ' mu' : '') + '">' +
        (side === 'home' ? cell : '<div class="s h"></div>') +
        '<div class="min">' + esc(e.min) + '</div>' +
        (side === 'away' ? cell : '<div class="s"></div>') +
        '</li>';
    });
    return h + '</ul>';
  }

  /* ---------------- 팀 기록 ---------------- */
  var STATS = [
    ['possession', '점유율', 'pct'], ['shots', '슈팅', 'int'], ['onTarget', '유효 슈팅', 'int'],
    ['xg', 'xG', 'x2'], ['corners', '코너킥', 'int'], ['fouls', '파울', 'int'],
    ['saves', '선방', 'int'], ['passes', '패스', 'int'], ['passAcc', '패스 성공률', 'pct']
  ];
  function fmtStat(v, kind) {
    if (typeof v !== 'number' || !isFinite(v)) return String(v == null ? '-' : v);
    if (kind === 'pct') return (Math.round(v * 10) / 10) + '%';
    if (kind === 'x2') return v.toFixed(2);
    return Math.round(v).toLocaleString();
  }
  function statsHtml(m) {
    var s = m && m.stats;
    if (!s) return '';
    var hc = teamColor(m.home && m.home.key), ac = teamColor(m.away && m.away.key);
    var rows = '';
    STATS.forEach(function (def) {
      var v = s[def[0]];
      if (!v || v.length < 2) return;
      var a = typeof v[0] === 'number' ? v[0] : null, b = typeof v[1] === 'number' ? v[1] : null;
      if (a == null && b == null) return;
      a = a || 0; b = b || 0;
      var tot = a + b, ra = tot > 0 ? (a / tot * 100) : 50;
      rows += '<div class="mv-st">' +
        '<span class="v h">' + esc(fmtStat(v[0], def[2])) + '</span>' +
        '<span class="mv-bar h"><i style="width:' + ra.toFixed(1) + '%;--bc:' + esc(hc) + '"></i></span>' +
        '<span class="k">' + esc(def[1]) + '</span>' +
        '<span class="mv-bar a"><i style="width:' + (100 - ra).toFixed(1) + '%;--bc:' + esc(ac) + '"></i></span>' +
        '<span class="v a">' + esc(fmtStat(v[1], def[2])) + '</span>' +
        '</div>';
    });
    return rows ? '<div class="mv-stats">' + rows + '</div>' : '';
  }

  /* ---------------- 라인업 ---------------- */
  function hasXI(t) { return !!(t && t.starters && t.starters.length); }

  function rowsFrom(starters) {
    var g = { GK: [], DF: [], MF: [], FW: [] };
    (starters || []).forEach(function (p) { (g[String(p.pos || '').toUpperCase()] || g.MF).push(p.n); });
    return [g.GK, g.DF, g.MF, g.FW].filter(function (r) { return r.length; });
  }

  function chipHtml(p, col) {
    var mk = '';
    if (p.goals > 0) mk += '<span class="mv-mk g" title="득점 ' + p.goals + '">⚽' + (p.goals > 1 ? p.goals : '') + '</span>';
    if (p.assists > 0) mk += '<span class="mv-mk a" title="도움 ' + p.assists + '">A' + (p.assists > 1 ? p.assists : '') + '</span>';
    if (p.cards && p.cards.length) mk += '<span class="mv-mk c">' + p.cards.map(function (c) { return cardIcon(c.type); }).join('') + '</span>';
    if (p.off) mk += '<span class="mv-mk o" title="' + esc(p.off.min + ' 교체 아웃') + '">↓</span>';
    var tt = [p.name, p.pos, p.captain ? '주장' : '', (typeof p.mins === 'number' ? p.mins + '분' : ''),
      p.off ? (p.off.min + ' 교체 → ' + p.off.by) : ''].filter(Boolean).join(' · ');
    return '<div class="mv-p" title="' + esc(tt) + '">' +
      '<span class="mv-sh" style="--bc:' + esc(col) + '">' + esc(p.n == null ? '' : p.n) + mk + '</span>' +
      '<span class="mv-pn"><span class="n">' + esc(shortName(p.name)) + '</span>' + (p.captain ? '<b>(C)</b>' : '') + '</span></div>';
  }

  function pitchHtml(t, key) {
    var byNum = {};
    (t.starters || []).forEach(function (p) { if (p && p.n != null) byNum[p.n] = p; });
    var rows = (t.rows && t.rows.length) ? t.rows.slice() : rowsFrom(t.starters);
    var used = {};
    rows.forEach(function (r) { (r || []).forEach(function (n) { used[n] = 1; }); });
    var left = (t.starters || []).filter(function (p) { return !used[p.n]; });
    if (left.length) rows.push(left.map(function (p) { return p.n; }));

    var col = teamColor(key);
    var h = '<div class="mv-pitch">';
    rows.slice().reverse().forEach(function (r) {      // GK 행이 아래(자기 골문)로 오게 뒤집는다
      if (!r || !r.length) return;
      h += '<div class="mv-prow">';
      r.forEach(function (n) { h += chipHtml(byNum[n] || { n: n, name: '' }, col); });
      h += '</div>';
    });
    return h + '</div>';
  }

  function benchHtml(t) {
    var subs = t.subs || [];
    if (!subs.length) return '';
    var h = '<ul class="mv-bench">';
    subs.forEach(function (p) {
      var mk = '';
      if (p.goals > 0) mk += '<span class="mv-tag">⚽' + (p.goals > 1 ? p.goals : '') + '</span>';
      if (p.assists > 0) mk += '<span class="mv-tag">A' + (p.assists > 1 ? p.assists : '') + '</span>';
      if (p.cards && p.cards.length) mk += '<span class="mv-tag" style="padding:0 2px">' + p.cards.map(function (c) { return cardIcon(c.type); }).join('') + '</span>';
      h += '<li class="' + (p.on ? '' : 'un') + '" title="' + esc([p.name, p.pos, typeof p.mins === 'number' ? p.mins + '분' : ''].filter(Boolean).join(' · ')) + '">' +
        '<span class="mv-bn">' + esc(p.n == null ? '-' : p.n) + '</span>' +
        '<span class="mv-bnm">' + esc(p.name) + '</span>' + mk +
        (p.on ? '<span class="mv-bon"><span class="mv-in">↑</span> ' + esc(p.on.min) + (p.on['for'] ? ' <em>' + esc(shortName(p.on['for'])) + '</em>' : '') + '</span>'
          : '<span class="mv-bon">미출전</span>') +
        '</li>';
    });
    return h + '</ul>';
  }

  function sideLuHtml(m, side) {
    var t = m[side] || {}, key = t.key;
    var h = '<div class="mv-side"><div class="mv-side-h">' + badge(key, 20, t) +
      '<span class="nm">' + esc(koName(key, t.name || t.short)) + '</span>' +
      (t.formation ? '<span class="fm">' + esc(t.formation) + '</span>' : '') + '</div>';
    if (t.manager) h += '<div class="mv-mgr">감독 ' + esc(t.manager) + '</div>';
    return h + pitchHtml(t, key) + benchHtml(t) + '</div>';
  }

  function stampOf(id, m) {
    var u = (m && m.updatedAt) || (idx()[id] && idx()[id].updatedAt) || '';
    var d = localTime(u);
    return d ? (pad(d.getHours()) + ':' + pad(d.getMinutes())) : '';
  }

  function lineupSection(id, fx, m, open) {
    var head = '<h4 class="mv-h">선발 라인업</h4>';
    if (!m || m.lineups === false || (!hasXI(m.home) && !hasXI(m.away))) {
      var t = stampOf(id, m);
      return '<section class="mv-sec">' + head + '<div class="mv-nolu">선발 라인업은 킥오프 약 1시간 전에 발표됩니다' +
        (t ? '<span>마지막 확인 ' + esc(t) + '</span>' : '') + '</div></section>';
    }
    return '<section class="mv-sec">' + head +
      '<button type="button" class="mv-lu-tg" aria-expanded="' + (open ? 'true' : 'false') + '">' +
      (open ? '선발 라인업 접기' : '선발 라인업 보기') + '</button>' +
      '<div class="mv-lu-body"' + (open ? '' : ' hidden') + '><div class="mv-lu">' +
      sideLuHtml(m, 'home') + sideLuHtml(m, 'away') + '</div></div></section>';
  }

  /* ---------------- 렌더 ---------------- */
  function buildHtml(fx, m, o) {
    var id = (fx && fx.id) || (m && m.id) || '';
    var mode = o.mode || 'full';
    if (mode === 'lineups') {
      return '<div class="mv">' + lineupSection(id, fx, m, o.lineupsOpen !== false) + '</div>';
    }
    var h = '<div class="mv">';
    if (o.header !== false) h += '<section class="mv-sec">' + headerHtml(fx, m, id) + '</section>';
    if (!m) return h + '<div class="mv-none">경기 상세 자료가 아직 없습니다.</div></div>';
    var tl = timelineOf(m);
    if (tl.length) h += '<section class="mv-sec"><h4 class="mv-h">골 · 카드 · 교체</h4>' + tlHtml(tl, m) + '</section>';
    var st = statsHtml(m);
    if (st) h += '<section class="mv-sec"><h4 class="mv-h">팀 기록</h4>' + st + '</section>';
    h += lineupSection(id, fx, m, !!o.lineupsOpen);
    return h + '</div>';
  }

  function wire(el) {
    var btns = el.querySelectorAll('.mv-lu-tg');
    Array.prototype.forEach.call(btns, function (b) {
      b.onclick = function () {
        var body = b.parentNode.querySelector('.mv-lu-body');
        if (!body) return;
        var open = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', open ? 'false' : 'true');
        b.textContent = open ? '선발 라인업 보기' : '선발 라인업 접기';
        body.hidden = open;
      };
    });
  }

  function render(el, fx, m, o) {
    if (!el) return;
    try {
      el.innerHTML = buildHtml(fx, m, o || {});
      wire(el);
    } catch (e) {
      el.innerHTML = '<div class="mv-err">경기 상세를 표시하지 못했습니다: ' + esc(e && e.message) + '</div>';
      if (window.console) console.error('[match-view]', e);
    }
  }

  return { init: init, load: load, render: render, index: idx, esc: esc };
})();
