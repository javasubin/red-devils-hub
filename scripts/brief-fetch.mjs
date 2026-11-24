#!/usr/bin/env node
// brief-fetch.mjs — 기사 페이지를 받아 메타 정보나 본문 문단을 뽑는다 (ROUTINE.md 1-C).
// 사용: node scripts/brief-fetch.mjs "<url>" ["<url>" ...]          og:image · og:url · og:title · article:published_time · canonical · JSON-LD datePublished
//       node scripts/brief-fetch.mjs --body "<url>" ["<url>" ...]   기사 본문 문단을 tmp-brief/body-<…>.txt 에 쓰고, 출력은 그 파일 경로 · 문단 수 · 글자 수만
//                                                                    (WebFetch가 막힌 BBC 본문용. 본문을 출력에 싣지 않아 Bash 출력 상한 3만 자에 걸리지 않는다)
//   URL 은 큰따옴표로 감싼다(& 같은 문자를 셸이 해석하지 않게). 한 번에 12개 이하.
//   브라우저 User-Agent, URL 하나당 25초 제한(리다이렉트 · 재요청 포함), 4개씩 병렬. 출력은 넘긴 순서대로 "### <url>" 머리줄 아래에.
//   없는 값은 (없음), 있어도 브리핑에 그대로 붙여 쓰기 위험한 꼴이면 (없음 — 거부: <이유>).
//   받지 못하면 그 URL 아래에 "실패: <원인>" 한 줄(HTTP 오류 · 0바이트 · 시간 초과 · 연결 실패 · 차단 · 크기 초과)이고, 종료 코드 1.
//   매체 도메인 제한: scripts/brief-domains.json(ROUTINE.md 1-B 매체 표)의 도메인과 그 하위 도메인(www. 등)만 연다 — 첫 주소와
//   리다이렉트 대상마다 요청하기 전에 본다. 목록 밖이면 요청하지 않고 "실패: 차단 — 매체 도메인 목록에 없는 주소 (<호스트>)".
//   내부망 차단: 공인 인터넷이 아닌 주소(사설 · 루프백 · 링크로컬 등)로는 요청하지 않는다 — URL 에 IP 를 직접 쓴 경우,
//   DNS 로 풀린 주소, 리다이렉트 대상(직접 따라가며 매번 다시 검사) 모두. 검사한 그 주소로만 연결해 DNS 재바인딩
//   (검사 때와 연결 때 주소가 다름)도 막는다. 응답은 압축을 푼 뒤 5 MB 까지만 받는다.
//   외부 패키지 없음(Node 22 내장).
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns';
import net from 'node:net';
import zlib from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
// Node 내장 fetch 가 붙이던 머리글과 같게 둔다(2026-11-24 확인) — 사이트의 봇 차단 판정이 예전과 달라지지 않게.
const HEADERS = { 'user-agent': UA, accept: '*/*', 'accept-language': '*', 'sec-fetch-mode': 'cors', 'accept-encoding': 'br, gzip, deflate' };
const TIMEOUT_SEC = 25;
const PARALLEL = 4;
const MAX_BYTES = 5 * 1024 * 1024;   // 응답 크기 상한(압축을 푼 뒤). BBC 기사 한 페이지가 약 0.4 MB
const MAX_REDIRECTS = 10;
const META_KEYS = ['og:image', 'og:url', 'og:title', 'article:published_time'];
const LABEL_WIDTH = 24;   // 가장 긴 이름 article:published_time 보다 넉넉히
const BODY_DIR = new URL('../tmp-brief/', import.meta.url);   // --body 본문 파일 (저장소 안 무시 폴더)

const argv = process.argv.slice(2);
const bodyMode = argv.includes('--body');
const urls = argv.filter(a => a !== '--body');
if (!urls.length || urls.some(a => a.startsWith('--'))) {
  console.error('사용: node scripts/brief-fetch.mjs [--body] "<url>" ["<url>" ...]');
  process.exit(2);
}

// ── 열 수 있는 매체 도메인 (ROUTINE.md 1-B). 형식: {"media":[{"name":"BBC Sport","domains":["bbc.com","bbc.co.uk"]}, …]}.
//   도메인은 소문자 이름.이름 꼴만(* · 포트 · 경로 · IP 없이). 목록을 못 읽거나 꼴이 틀리면 아무 주소도 열지 않는다.
const DOMAINS = (() => {
  try {
    const list = JSON.parse(fs.readFileSync(new URL('./brief-domains.json', import.meta.url), 'utf8'));
    const domains = list.media.flatMap(m => m.domains);
    if (domains.length && domains.every(d => typeof d === 'string' && /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/.test(d))) return domains;
  } catch { /* 아래에서 멈춘다 */ }
  console.error('매체 도메인 목록 scripts/brief-domains.json 을 읽지 못함(없음 · JSON 아님 · 도메인 꼴이 틀림) — 아무 주소도 열지 않는다');
  process.exit(1);
})();
const isListedHost = host => DOMAINS.some(d => host === d || host.endsWith('.' + d));

// ── 내부망 차단 목록: 공인 인터넷이 아닌 주소. 이 PC(회사망)에서 사내 서비스 · 공유기 · 클라우드 메타데이터로 가는 요청을 막는다.
//   IPv4 를 담은 IPv6(::ffff:a.b.c.d)는 BlockList 가 IPv4 규칙으로 판정한다.
const BLOCKED = new net.BlockList();
for (const [addr, prefix] of [
  ['0.0.0.0', 8],          // "이 네트워크" — 0.0.0.0 은 이 PC 자신으로 연결될 수 있다
  ['10.0.0.0', 8],         // 사설
  ['100.64.0.0', 10],      // 통신사 공유 주소(CGNAT)
  ['127.0.0.0', 8],        // 루프백
  ['169.254.0.0', 16],     // 링크로컬 (클라우드 메타데이터 169.254.169.254 포함)
  ['172.16.0.0', 12],      // 사설 (사내망 172.16.x.x 포함)
  ['192.0.0.0', 24],       // IETF 예약
  ['192.0.2.0', 24], ['198.51.100.0', 24], ['203.0.113.0', 24],   // 문서용
  ['192.168.0.0', 16],     // 사설
  ['198.18.0.0', 15],      // 장비 시험용
  ['224.0.0.0', 4],        // 멀티캐스트
  ['240.0.0.0', 4],        // 예약 · 브로드캐스트(255.255.255.255)
]) BLOCKED.addSubnet(addr, prefix, 'ipv4');
for (const [addr, prefix] of [
  ['::', 96],              // 미지정(::) · 루프백(::1) · 옛 IPv4 호환 주소
  ['64:ff9b::', 96], ['64:ff9b:1::', 48],   // NAT64 — 안에 든 IPv4 가 사설일 수 있다
  ['100::', 64],           // 버림용
  ['2001::', 32],          // Teredo — 안에 IPv4 를 담는다
  ['2001:db8::', 32],      // 문서용
  ['2002::', 16],          // 6to4 — 안에 IPv4 를 담는다
  ['fc00::', 7],           // 고유 로컬(사설)
  ['fe80::', 10],          // 링크로컬
  ['fec0::', 10],          // 옛 사이트 로컬
  ['ff00::', 8],           // 멀티캐스트
]) BLOCKED.addSubnet(addr, prefix, 'ipv6');

const isBlockedIp = ip => BLOCKED.check(ip, net.isIPv6(ip) ? 'ipv6' : 'ipv4');
const fetchError = (code, message) => Object.assign(new Error(message), { code });
const blocked = detail => fetchError('BLOCKED', `차단 — 공인 인터넷 주소가 아님 (${detail})`);

// 소켓이 연결할 주소를 고르는 lookup. 소켓은 여기서 돌려준 주소로만 연결하므로 검사한 주소 = 연결하는 주소다
// (DNS 를 따로 두 번 풀지 않아 DNS 재바인딩이 끼어들 틈이 없다). 풀린 주소 중 하나라도 막힌 것이면 거부한다.
function safeLookup(hostname, options, callback) {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    const bad = addresses.find(a => isBlockedIp(a.address));
    if (bad) return callback(blocked(`${hostname} → ${bad.address}`));
    if (options.all) callback(null, addresses);
    else callback(null, addresses[0].address, addresses[0].family);
  });
}

// 압축 풀기 — 끝이 잘린 압축도 받은 데까지는 풀도록 느슨하게(Node 내장 fetch 와 같음)
const DECODERS = {
  gzip: () => zlib.createGunzip({ flush: zlib.constants.Z_SYNC_FLUSH, finishFlush: zlib.constants.Z_SYNC_FLUSH }),
  'x-gzip': () => zlib.createGunzip({ flush: zlib.constants.Z_SYNC_FLUSH, finishFlush: zlib.constants.Z_SYNC_FLUSH }),
  deflate: () => zlib.createInflate({ flush: zlib.constants.Z_SYNC_FLUSH, finishFlush: zlib.constants.Z_SYNC_FLUSH }),
  br: () => zlib.createBrotliDecompress({ flush: zlib.constants.BROTLI_OPERATION_FLUSH, finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH }),
};
const tooBig = () => fetchError('TOO_BIG', `응답이 너무 큼 (${MAX_BYTES / 1024 / 1024} MB 넘음)`);

// 요청 한 번(리다이렉트는 따라가지 않음). 2xx 면 본문을 끝까지 읽고(크기 상한), 아니면 본문은 버리고 상태 · Location 만.
// 2xx 가 아니면 연결을 끊는다 — 다음 요청은 새 연결로 간다(아래 403 재요청이 새 연결이어야 함).
async function get(u, signal) {
  const res = await new Promise((resolve, reject) => {
    (u.protocol === 'https:' ? https : http).get(u, { headers: HEADERS, lookup: safeLookup, signal }, resolve).on('error', reject);
  });
  const { statusCode: status, statusMessage: statusText } = res;
  if (status < 200 || status > 299) { res.destroy(); return { status, statusText, location: res.headers.location }; }
  if (Number(res.headers['content-length']) > MAX_BYTES) { res.destroy(); throw tooBig(); }
  const enc = (res.headers['content-encoding'] || 'identity').trim().toLowerCase();
  if (enc !== 'identity' && !DECODERS[enc]) { res.destroy(); throw fetchError('BAD_ENCODING', `모르는 압축 형식 (${enc})`); }
  const chunks = [];
  let size = 0;
  try {
    await pipeline(res, ...(DECODERS[enc] ? [DECODERS[enc]()] : []), async source => {
      for await (const chunk of source) {
        if ((size += chunk.length) > MAX_BYTES) return;   // 상한을 넘으면 그만 읽는다 — 남은 흐름과 연결은 pipeline 이 끊는다
        chunks.push(chunk);
      }
    });
  } catch (e) {
    if (size <= MAX_BYTES) throw e;   // 그만 읽은 경우 pipeline 은 AbortError 로 끝나므로 아래에서 크기 초과로 알린다
  }
  if (size > MAX_BYTES) throw tooBig();
  return { status, statusText, html: Buffer.concat(chunks).toString('utf8') };
}

// 실패 원인 한 줄. 시간 초과 여부는 오류 이름이 아니라 제한 신호로 판단한다(pipeline 은 다른 이유로도 AbortError 를 낸다).
function describe(e, signal) {
  if (signal.aborted) return `시간 초과 (${TIMEOUT_SEC}초)`;
  if (['BLOCKED', 'TOO_BIG', 'BAD_ENCODING'].includes(e.code)) return e.message;
  if (e.code === 'ETIMEDOUT') return '시간 초과 (연결 단계)';
  return `연결 실패 (${e.code || e.message})`;
}

// 페이지 하나를 받는다. 리다이렉트는 직접 따라가며 단계마다 주소를 다시 검사한다. 성공 { html } / 실패 { error }
async function load(url) {
  let u;
  try { u = new URL(url); } catch { return { error: '잘못된 URL' }; }
  const signal = AbortSignal.timeout(TIMEOUT_SEC * 1000);   // 연결부터 본문 다 받을 때까지 전체 제한 (리다이렉트 · 재요청 포함 25초)
  let redirects = 0, retried403 = false;
  for (;;) {
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return { error: redirects ? `리다이렉트 대상이 http(s) URL 이 아님 (${u.protocol})` : 'http(s) URL 이 아님' };
    // IP 를 직접 쓴 URL 은 DNS 를 거치지 않아 lookup 이 불리지 않으므로 여기서 본다. URL 해석이 0x7f.1 · 2130706433 같은
    // 꼴도 127.0.0.1 로 바꿔 준다. IPv6 는 [ ] 를 벗긴다.
    const host = u.hostname.replace(/^\[(.*)\]$/, '$1');
    if (net.isIP(host) && isBlockedIp(host)) return { error: blocked(host).message };
    if (!isListedHost(u.hostname))
      return { error: `차단 — 매체 도메인 목록에 없는 주소 (${u.hostname})${redirects ? ' — 리다이렉트 대상' : ''}` };
    let r;
    try { r = await get(u, signal); } catch (e) { return { error: describe(e, signal) }; }
    // theguardian.com 은 Node 의 첫 TLS 연결에 403 을 주고, TLS 세션을 이어 쓰는 다음 연결에는 200 을 준다
    // (2026-11-24 확인 — curl 은 첫 요청에 200). 그래서 403 이면 새 연결로 한 번만 다시 요청한다.
    if (r.status === 403 && !retried403) { retried403 = true; continue; }
    if ([301, 302, 303, 307, 308].includes(r.status) && r.location) {
      if (++redirects > MAX_REDIRECTS) return { error: `리다이렉트가 ${MAX_REDIRECTS}번을 넘음` };
      try { u = new URL(r.location, u); } catch { return { error: '잘못된 리다이렉트 주소' }; }
      continue;
    }
    if (r.status < 200 || r.status > 299) return { error: `HTTP ${r.status}${r.statusText ? ' ' + r.statusText : ''}` };
    if (!r.html.length) return { error: `0바이트 (HTTP ${r.status})` };
    return { html: r.html };
  }
}

// 태그 하나의 속성들. 값은 페이지에 적힌 그대로(&amp; 같은 엔티티를 풀지 않는다 — HTML에 그대로 붙여 쓰기 좋게).
function attrs(tag) {
  const a = new Map();
  for (const m of tag.matchAll(/([^\s=<>\/"']+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
    const k = m[1].toLowerCase();
    if (!a.has(k)) a.set(k, m[2] ?? m[3] ?? m[4]);
  }
  return a;
}

// 값을 내보내도 되는지. 안 되면 거부 이유, 되면 null.
//   - og:image · og:url · canonical : 썸네일 src · 기사 링크(href)로 브리핑에 그대로 붙여 쓰므로 https 주소이고
//     따옴표 · <> · 공백이 없을 때만. 엔티티(&amp; · &quot; 등)는 속성값 안에서 따옴표를 닫지 못해 그대로 둬도 된다.
//   - og:title : {{TITLE_EN}}(본문 글자 자리)으로 옮겨 쓰일 수 있어 태그를 열 수 있는 < > 가 있으면 내보내지 않는다.
//     따옴표는 글자 자리에서 무해해 그대로 둔다.
//   - 발행 시각(article:published_time · datePublished) : {{PUBLISHED}} 꼴(2026.09.04 07:12)로 다시 써서 붙이므로 그대로 둔다.
//   게시 전 마지막 방어는 검사기(check-briefing.mjs: https · on* · script · 태그 허용 목록)다.
function rejectReason(key, v) {
  if (key === 'og:image' || key === 'og:url' || key === 'canonical') {
    if (!v.startsWith('https://')) return 'https 주소가 아님';
    if (!/^https:\/\/[^\s"'<>]+$/.test(v)) return '따옴표 · <> · 공백이 들어 있음';
  } else if (key === 'og:title' && /[<>]/.test(v)) return '<> 가 들어 있음';
  return null;
}

function metaLines(html) {
  const found = new Map([...META_KEYS, 'canonical'].map(k => [k, new Set()]));
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    const key = (a.get('property') || a.get('name') || a.get('itemprop') || '').toLowerCase();
    if (META_KEYS.includes(key) && a.has('content')) found.get(key).add(a.get('content'));
  }
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    if ((a.get('rel') || '').toLowerCase().split(/\s+/).includes('canonical') && a.get('href')) found.get('canonical').add(a.get('href'));
  }
  // 발행 시각: BBC 는 article:published_time 메타가 없고 JSON-LD 의 datePublished 에 있다. 페이지에서 처음 나온 값.
  const dp = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
  found.set('datePublished(JSON-LD)', new Set(dp ? [dp[1]] : []));

  const lines = [];
  for (const [k, vals] of found) {
    const ok = [...vals].filter(v => !rejectReason(k, v));
    const why = [...vals].map(v => rejectReason(k, v)).find(Boolean);
    if (!ok.length) lines.push(k.padEnd(LABEL_WIDTH) + (why ? `(없음 — 거부: ${why})` : '(없음)'));
    for (const v of ok) lines.push(k.padEnd(LABEL_WIDTH) + v);
  }
  return lines.join('\n');
}

// 기사 본문 문단: 진짜 <p> 태그(<p> 또는 <p 속성…>)만 — <path> · <picture> 를 잡지 않게. 태그를 지우고 40자 넘는 것만.
// <article> 이 있으면 첫 <article> 부터 마지막 </article> 까지만 본다 — BBC 는 그 밖이 머리 메뉴 · 다른 기사 홍보 · 푸터다.
function bodyParagraphs(html) {
  const start = html.search(/<article\b/i);
  const end = [...html.matchAll(/<\/article>/gi)].at(-1)?.index ?? -1;   // 마지막 </article>
  const scope = start >= 0 && end > start ? html.slice(start, end) : html;
  return [...scope.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(t => t.length > 40);
}

// --body : 본문을 tmp-brief/ 에 파일로 쓰고 경로 · 문단 수 · 글자 수 한 줄을 돌려준다.
// 파일 이름 = URL 마지막 경로 조각(영숫자 · - 만) + URL 해시 8자리 — 같은 URL 은 같은 파일, 다른 URL 끼리는 겹치지 않는다.
function writeBody(url, html) {
  const ps = bodyParagraphs(html);
  if (!ps.length) return '(40자 넘는 <p> 문단 없음 — 클라이언트 렌더링 페이지일 수 있음)';
  const text = ps.join('\n\n');
  const slug = (new URL(url).pathname.split('/').filter(Boolean).pop() || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 40) || 'page';
  const fileUrl = new URL(`body-${slug}-${createHash('sha1').update(url).digest('hex').slice(0, 8)}.txt`, BODY_DIR);
  fs.mkdirSync(BODY_DIR, { recursive: true });
  fs.writeFileSync(fileUrl, `### ${url}\n\n${text}\n`, 'utf8');
  return `본문 ${fileURLToPath(fileUrl)} — 문단 ${ps.length}개 · ${text.length.toLocaleString('en-US')}자 (Read 로 읽는다)`;
}

// PARALLEL 개씩 동시에 받고, 결과는 넘긴 순서대로 모은다.
const results = new Array(urls.length);
let next = 0;
async function worker() {
  while (next < urls.length) {
    const i = next++;
    const r = await load(urls[i]);
    if (!r.error && bodyMode) {
      try { results[i] = writeBody(urls[i], r.html); } catch (e) { r.error = `본문 파일을 쓰지 못함 (${e.code || e.message})`; }
    } else if (!r.error) results[i] = metaLines(r.html);
    if (r.error) { results[i] = '실패: ' + r.error; process.exitCode = 1; }
  }
}
await Promise.all(Array.from({ length: Math.min(PARALLEL, urls.length) }, worker));

console.log(urls.map((url, i) => `### ${url}\n${results[i]}`).join('\n\n'));
