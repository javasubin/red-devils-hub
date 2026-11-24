#!/usr/bin/env node
// brief-bot.mjs — 브리핑 무인 실행 스크립트 (ROUTINE.md "무인 실행" 절, 계획 .omc/plans/brief-bot.md 2단계). Windows 전용.
// 사용: node scripts/brief-bot.mjs [--no-push] [--clone <경로>] [--model <모델>] [--effort <값>] [--timeout-min <분>]
//   매일 17:30 작업 스케줄러가 node C:\red-devils-hub-brief\scripts\brief-bot.mjs 로 부른다.
//   ⓪ 클론 폴더에 여럿이 쓰는 계정(Everyone · Authenticated Users · Users)의 쓰기 권한이 보이면 git 을 부르기 전에 실패한다.
//   ① 전용 클론을 origin/main 으로 맞춘다(fetch → reset --hard → clean -fd → tmp-brief/ 비우기). 오늘(KST) 브리핑이 이미 있으면 끝.
//   ② 오늘 날짜와 매체 도메인 목록(scripts/brief-domains.json)으로 봇 설정을 logs/ 에 만들고 claude -p 로 ROUTINE.md 를 돌린다
//      (좁은 허용 · 전역 설정 뺌 · 시간 제한).
//   ③ 바뀐 것이 오늘 브리핑 HTML(팀마다 하나)과 briefings.js 뿐이고 검사기를 통과하고, 새 HTML 의 링크가 매체 도메인이고
//      이메일 주소 꼴 · headline 의 제어 · 양방향 문자가 없으면 ROUTINE.md 7절 형식으로 커밋하고
//      pull --rebase 뒤 push 한다(거부되면 한 번만 다시).
//   종료 코드: 성공 · 건너뜀 0, 실패 1, 사용법 오류 2. 로그: 클론의 logs/<ISO>.log (같은 날은 이어 쓰기, logs/ 는 gitignore).
//   --no-push             커밋까지만 한다(시험 실행용). 그 커밋은 다음 실행의 reset 에서 사라진다.
//   --clone <경로>         전용 클론 (기본 C:\red-devils-hub-brief). reset --hard · clean -fd 를 하므로 사람이 작업하는 저장소는 주지 않는다
//                          (봇이 만들 수 없는 변경이 있으면 손대지 않고 실패한다).
//   --model <모델>         기본 opus. 결과에 적힌 실제 모델이 다르면 실패.   --effort <값>  기본 high (low · medium · high · xhigh · max)
//   --timeout-min <분>     claude 시간 제한 (기본 60). 넘으면 claude.exe 와 그 자식 프로세스를 모두 죽이고 실패.
//   --claude-script <파일> 시험용: claude.exe 대신 그 node 스크립트를 같은 인자 · 환경으로 실행한다(과금 없는 가짜 claude).
//   보안 검사를 끄는 옵션과 날짜를 바꾸는 옵션은 없다(늘 오늘).
//   (내부) --tool-guard    claude 의 PreToolUse 훅(Bash · WebFetch). 봇 설정이 이 파일을 훅으로 건다(아래 BASH_ALLOWED · toolGuard).
//   외부 패키지 없음(Node 22 내장만).
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

// 작업 폴더의 실행 파일을 PATH 보다 먼저 찾지 않게 한다 — 어떤 자식 프로세스보다 먼저. Node(libuv)는 이 변수가 없으면
// spawn('git', …, { cwd: 클론 }) 에서 클론 폴더의 git.exe 를 PATH 의 git 보다 먼저 실행한다(2026-11-24 확인). Claude Code 의
// 셸에는 이 변수가 있어 시험에서는 드러나지 않았고, 작업 스케줄러 환경(레지스트리의 사용자 · 시스템 변수)에는 없다.
// 자식(git · claude)의 환경에도 그대로 넘어간다.
process.env.NoDefaultCurrentDirectoryInExePath = '1';

const DEFAULT_CLONE = 'C:\\red-devils-hub-brief';
const CLAUDE_EXE = path.join(process.env.USERPROFILE ?? '', '.local', 'bin', 'claude.exe');
// claude 에 주는 도구 — 루틴에 필요한 것만. 그 밖의 도구(Task · PowerShell · 원격 세션 · 메시지 · 예약 등)는 아예 없게 한다.
const TOOLS = 'Bash,Read,Glob,Grep,Write,Edit,WebSearch,WebFetch';
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'];
const GIT_NET_TIMEOUT_MS = 5 * 60 * 1000;   // fetch · pull · push — 자격 증명 창 같은 것으로 멈춰 있지 않게
const STEP_TIMEOUT_MS = 2 * 60 * 1000;      // 그 밖의 git · 검사기 · 권한 검사
// git 이 사람에게 묻지 않게(묻는 대신 실패해 로그에 남는다).
const GIT_ENV = { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' };
// 자식 claude 환경에서 남기는 CLAUDE* 변수 — 설치 위치 · 인증만 (claudeEnv 참고).
const KEEP_CLAUDE_ENV = new Set(['CLAUDE_CODE_GIT_BASH_PATH', 'CLAUDE_CONFIG_DIR', 'CLAUDE_CODE_OAUTH_TOKEN']);
// 열 수 있는 매체 도메인 목록 (ROUTINE.md 1-B, 계획 D7) — 봇 설정의 WebFetch 허용 규칙 · 도구 가드 · push 전 링크 검사가 같이 쓴다.
// brief-fetch.mjs 도 같은 파일을 읽는다.
const DOMAINS_FILE = 'scripts/brief-domains.json';

// ── 도구 가드 (PreToolUse 훅, 봇 설정이 Bash · WebFetch 에 건다)
//   Bash: ROUTINE.md 명령 블록의 꼴만 통과시킨다.
//     권한 규칙만으로는 부족하다 — Claude Code 는 읽기 전용으로 보는 명령(ls · cat · grep · rg · git status 등)을 dontAsk 에서도
//     허용 규칙 없이 실행한다(2.1.331 에서 확인: "grep -r X ." 가 .git/config 를 출력). 훅은 그보다 먼저 불려 막을 수 있다.
//     셸이 해석할 문자($ ` ; & | > < 등)가 낄 자리가 없게 했다. URL 은 큰따옴표(안에 $ ` \ " 없이)나 작은따옴표 안에만.
//     check-briefing 의 파일 인자는 briefings/ 바로 아래 .html 만 — 저장소 밖 파일을 읽게 하지 않는다.
//     brief-fetch 주소의 도메인은 여기서 보지 않는다 — brief-fetch 가 요청 전에 직접 보고(사람이 돌릴 때도 같다), 여기서 막으면
//     한 번에 넘긴 목록 안 주소들까지 같이 막힌다.
//   WebFetch: 주소의 호스트가 매체 도메인 목록의 도메인이거나 그 하위 도메인이어야 한다. 봇 설정의 WebFetch(domain:…) 허용 규칙과
//     같은 목록인데 여기서도 보는 까닭: Claude Code 2.1.331 은 내장 '미리 허용된 호스트'(docs.python.org 등 문서 사이트 약 100곳)를
//     허용 규칙이 없어도 연다(claude.exe 코드로 확인 — 허용 규칙 다음, 묻기 전에 허용).
const BASH_ALLOWED = [
  /^node scripts\/brief-env\.mjs(?: --clubs)?$/,
  /^node scripts\/brief-fetch\.mjs(?: --body)?(?: (?:"https?:\/\/[^\s"$`\\]+"|'https?:\/\/[^\s']+'))+$/,
  /^node scripts\/check-briefing\.mjs(?: (?:--index|--date \d{4}-\d{2}-\d{2}|--team [a-z0-9-]+|briefings\/[A-Za-z0-9._-]+\.html))+$/,
];

// ── push 전 글자 검사에 쓰는 것들
// 이메일 주소 꼴: 아이디@이름.최상위(영문 2자 이상). 이미지 파일 이름의 "@2x.png" 같은 꼴은 빼려고 최상위가 이미지 확장자면 아니다.
const EMAIL = /[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+(?!(?:jpe?g|png|gif|webp|svg|avif)\b)[A-Za-z]{2,}/;
// 제어 · 양방향 문자 — 터미널 이스케이프(U+001B 등) · 글자 방향 뒤집기(U+202E 등) · 폭 없는 문자
const CONTROL = /[\p{Cc}\p{Cf}]/u;
// HTML 이름 문자 참조 가운데 주소 · 이메일 꼴을 바꿀 수 있는 것(대소문자 무시). 숫자 참조(&#64; · &#x40;)는 모두 푼다.
const NAMED_REFS = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", tab: '\t', newline: '\n', colon: ':', sol: '/', bsol: '\\', period: '.',
  commat: '@', quest: '?', num: '#', percnt: '%', lowbar: '_', plus: '+', equals: '=', excl: '!', dollar: '$', semi: ';', comma: ',',
};

// ── 클론 폴더 권한 검사 (계획 D8) — git 을 부르기 전에. 운영 클론은 Administrators · SYSTEM · 이 계정만 쓸 수 있게 좁혀 두었다.
//   여럿이 쓰는 계정(Everyone · Authenticated Users · Users)에 쓰기 계열 권한이 있거나 그 계정이 소유자면 실패한다.
//   권한이 다시 열린 것(폴더를 새로 만든 경우 등)을 알아채는 용도다 — 권한이 열려 있는 동안에는 이 검사 코드도 고쳐질 수 있어서
//   그 상태의 공격을 막는 장치는 아니다. 계정 이름은 Windows 언어마다 달라 SID 로 비교한다. 상속 전용 항목(안에 새로 생기는
//   파일 · 폴더에 붙는 권한)도 센다.
const OPEN_SIDS = { 'S-1-1-0': 'Everyone', 'S-1-5-11': 'Authenticated Users', 'S-1-5-32-545': 'Users' };
// 쓰기 계열 권한 비트 — 쓰기 · 덧붙이기(폴더면 파일 · 하위 폴더 만들기) · 확장 특성 쓰기 · 하위 항목 지우기 · 특성 쓰기 · 지우기 ·
// 권한 바꾸기 · 소유권 가져오기 · GENERIC_ALL · GENERIC_WRITE
const WRITE_RIGHTS = 0x2 | 0x4 | 0x10 | 0x40 | 0x100 | 0x10000 | 0x40000 | 0x80000 | 0x10000000 | 0x40000000;
const POWERSHELL = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');

let CLONE, ISO, STAMP, LOGS, LOG_FILE;   // main 이 한 번 정한다 (STAMP = <ISO>-<시분초>, 이번 실행의 logs/ 파일 이름 앞부분)

if (process.argv[2] === '--tool-guard') await toolGuard();
else process.exitCode = await main();

// 훅 입력(JSON)의 도구 호출이 허용 꼴이면 그냥 끝내고(그다음은 권한 규칙이 정한다), 아니면 종료 코드 2 로 막는다.
// 훅이 2 말고 다른 코드로 끝나면 claude 는 막지 않고 진행하므로, 입력 · 목록을 못 읽은 경우도 2 로 막는다.
async function toolGuard() {
  let input = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) input += chunk;
  let hook = {};
  try { hook = JSON.parse(input) ?? {}; } catch { /* 못 읽으면 빈 명령 — 아래에서 막힌다 */ }
  if (hook.tool_name === 'WebFetch') {
    const url = String(hook.tool_input?.url ?? '');
    let listed = false;
    try { listed = isListedHost(new URL(url).hostname, readDomains(new URL('./brief-domains.json', import.meta.url))); }
    catch { /* 주소 · 목록을 못 읽음 — 막는다 */ }
    if (listed) return;
    process.stderr.write(`무인 실행의 WebFetch 는 매체 도메인 목록(${DOMAINS_FILE})의 도메인과 그 하위 도메인만 열 수 있다. 받은 주소: ${url}`);
    process.exit(2);
  }
  const command = hook.tool_input?.command ?? '';
  if (BASH_ALLOWED.some(re => re.test(command))) return;
  process.stderr.write('무인 실행에서는 ROUTINE.md 명령 블록의 꼴 그대로만 실행할 수 있다 — ' +
    'node scripts/brief-env.mjs [--clubs] · node scripts/brief-fetch.mjs [--body] "<URL>" … (URL 은 큰따옴표로) · ' +
    'node scripts/check-briefing.mjs briefings/<파일>.html · node scripts/check-briefing.mjs --index --date <ISO>. ' +
    `파이프 · && · 리다이렉트 · cd 와 그 밖의 명령은 막힌다. 받은 명령: ${command}`);
  process.exit(2);
}

async function main() {
  const opt = parseArgs(process.argv.slice(2));
  if (!opt) {
    console.error('사용: node scripts/brief-bot.mjs [--no-push] [--clone <경로>] [--model <모델>] ' +
                  '[--effort low|medium|high|xhigh|max] [--timeout-min <분>] [--claude-script <파일>]');
    return 2;
  }
  CLONE = path.resolve(opt.clone);
  if (!fs.existsSync(path.join(CLONE, '.git'))) { console.error(`git 클론이 아님: ${CLONE}`); return 1; }
  const start = new Date();
  ISO = kstDate(start);
  STAMP = `${ISO}-${kstTime(start).replaceAll(':', '')}`;
  LOGS = path.join(CLONE, 'logs');
  LOG_FILE = path.join(LOGS, `${ISO}.log`);
  fs.mkdirSync(LOGS, { recursive: true });

  log(`==== ${ISO} ${kstTime(start)} 시작 (pid ${process.pid}) — 클론 ${CLONE} · 모델 ${opt.model} · effort ${opt.effort} · ` +
      `제한 ${opt.timeoutMin}분${opt.noPush ? ' · --no-push' : ''}${opt.claudeScript ? ` · 가짜 claude ${opt.claudeScript}` : ''}`);
  const state = { claudeStarted: false };
  try {
    const outcome = await runBot(opt, state);
    log(`==== 끝 — ${outcome} (${elapsed(start)})`);
    return 0;
  } catch (e) {
    log(`실패: ${e.message}`);
    if (state.claudeStarted) {
      try { await keepRejectedAndRestore(); } catch (e2) { log(`클론 되돌리기 실패: ${e2.message}`); }
    }
    log(`==== 끝 — 실패 (${elapsed(start)})`);
    return 1;
  }
}

function parseArgs(argv) {
  const opt = { noPush: false, clone: DEFAULT_CLONE, model: 'opus', effort: 'high', timeoutMin: 60, claudeScript: null };
  for (let i = 0; i < argv.length; i++) {
    const [a, v] = [argv[i], argv[i + 1]];
    if (a === '--no-push') opt.noPush = true;
    else if (a === '--clone' && v) { opt.clone = v; i++; }
    else if (a === '--model' && /^[A-Za-z0-9._[\]-]+$/.test(v ?? '')) { opt.model = v; i++; }
    else if (a === '--effort' && EFFORTS.includes(v)) { opt.effort = v; i++; }
    else if (a === '--timeout-min' && Number(v) > 0 && Number(v) <= 24 * 60) { opt.timeoutMin = Number(v); i++; }   // setTimeout 상한(약 24일) 아래로
    else if (a === '--claude-script' && v) { opt.claudeScript = path.resolve(v); i++; }
    else return null;
  }
  return opt;
}

async function runBot(opt, state) {
  // ── 0. 클론 폴더 권한 — git 을 부르기 전에
  checkClonePermissions();

  // ── 1. 클론을 origin/main 으로 — 사람이 만든 변경이 있으면 손대지 않는다
  const branch = (await git(['symbolic-ref', '--short', '-q', 'HEAD'], { allowFail: true })).stdout.trim();
  if (branch !== 'main') throw new Error(`클론이 main 브랜치가 아님 (${branch || 'detached HEAD'})`);
  const foreign = (await changedFiles()).filter(e => !leftoverOfBot(e));
  if (foreign.length) throw new Error(`클론에 봇이 만들 수 없는 변경이 있어 reset 하지 않음 — 사람이 확인: ${showChanges(foreign)}`);
  await git(['fetch', '-q', 'origin'], { net: true });
  await git(['reset', '-q', '--hard', 'origin/main']);
  if ((await git(['check-ignore', '-q', 'logs/x'], { allowFail: true })).code !== 0)
    throw new Error('origin/main 의 .gitignore 가 logs/ 를 무시하지 않음 (clean -fd 가 로그를 지운다)');
  await git(['clean', '-q', '-fd']);
  fs.rmSync(path.join(CLONE, 'tmp-brief'), { recursive: true, force: true });   // 무시 대상이라 clean 이 안 지운다
  log(`클론 = origin/main ${await head()} (fetch · reset --hard · clean -fd · tmp-brief/ 비움)`);

  // ── 2. reset 뒤의 저장소 파일 읽기 — 1단계 함수로, 데이터 파일은 코드로 실행하지 않고 JSON 으로 읽는다.
  //   reset 직후라 brief-env.mjs · clubs.js · 매체 도메인 목록은 origin/main 그대로다(봇이 쓸 수 없는 파일). 이 모듈의
  //   readJsonAssignment 를 claude 가 끝난 뒤 briefings.js 를 다시 읽을 때도 쓴다(모듈은 지금 한 번 읽혀 고정된다).
  const repo = await import(pathToFileURL(path.join(CLONE, 'scripts', 'brief-env.mjs')).href);
  const baseList = repo.readJsonAssignment('briefings.js', 'HUB_BRIEFINGS');
  if (!Array.isArray(baseList)) throw new Error('origin/main 의 briefings.js 가 배열이 아님');
  if (baseList[0]?.date === ISO) {
    log(`origin/main 의 briefings.js 첫 항목이 오늘(${ISO}) — 이미 있음`);
    return '건너뜀 (오늘 브리핑이 이미 있음)';
  }
  const teams = repo.readJsonAssignment('data.js', 'HUB')?.meta?.teams;
  if (!Array.isArray(teams) || !teams.length || !teams.every(t => /^[a-z0-9-]+$/.test(t)))
    throw new Error('data.js 의 HUB.meta.teams 가 팀 키 배열이 아님');
  const names = teamShortNames(teams, readRepoText('ROUTINE.md'), repo.loadClubs());
  const domains = readDomains(path.join(CLONE, DOMAINS_FILE));
  log(`마지막 브리핑 ${baseList[0]?.date ?? '(없음)'} → 오늘 ${ISO} 를 만든다 · 팀 ${teams.join(', ')}`);

  // ── 3. claude
  const settingsFile = writeSettings(domains);
  state.claudeStarted = true;
  await runClaude(opt, settingsFile);

  // ── 4. push 전 검사
  const { files, entry } = await checkOutput(teams, baseList, repo, domains);

  // ── 5. 커밋 (ROUTINE.md 7절 형식, 메시지는 파일로) — 이메일 주소 꼴은 커밋 메시지까지 만든 뒤에 보고 커밋한다
  const message = commitMessage(entry, teams, names);
  checkEmails(files, entry, message);
  await git(['add', '--', ...files]);
  const msgFile = path.join(LOGS, `${STAMP}-commit-msg.txt`);
  fs.writeFileSync(msgFile, message);
  await git(['commit', '-q', '-F', msgFile]);
  log(`커밋 ${await head()}:\n${indent(message.trimEnd())}`);
  if (opt.noPush) return '커밋까지 (--no-push — push 안 함. 이 커밋은 다음 실행의 reset 에서 사라진다)';

  // ── 6. push
  await push(files);
  return `push 완료 (${await head()})`;
}

// 클론 폴더 권한 검사(위 OPEN_SIDS 설명). 클론 · scripts · .git · .git/config · .git/hooks 의 ACL 을 PowerShell Get-Acl 로 SID 로 읽는다.
function checkClonePermissions() {
  const targets = ['', 'scripts', '.git', '.git/config', '.git/hooks'].map(p => path.join(CLONE, p)).filter(p => fs.existsSync(p));
  // 경로는 작은따옴표 문자열로 넣는다(PowerShell 에서 작은따옴표 안은 그대로, ' 는 '' 로). 출력에는 경로 대신 번호를 쓴다.
  const list = targets.map(p => `'${p.replaceAll("'", "''")}'`).join(', ');
  const script = `$ErrorActionPreference = 'Stop'; $i = 0; foreach ($p in @(${list})) { $acl = Get-Acl -LiteralPath $p; ` +
    `'{0}|owner|{1}' -f $i, $acl.GetOwner([Security.Principal.SecurityIdentifier]).Value; ` +
    `foreach ($r in $acl.GetAccessRules($true, $true, [Security.Principal.SecurityIdentifier])) { ` +
    `'{0}|{1}|{2}|{3}' -f $i, $r.AccessControlType, $r.IdentityReference.Value, [int64]$r.FileSystemRights }; $i++ }`;
  const r = spawnSync(POWERSHELL, ['-NoProfile', '-NonInteractive', '-Command', script],
                      { encoding: 'utf8', windowsHide: true, timeout: STEP_TIMEOUT_MS });
  if (r.status !== 0) throw new Error(`클론 폴더 권한을 읽지 못함 (powershell 종료 코드 ${r.status}): ${oneLine(r.stderr || r.error?.message || r.stdout)}`);
  const open = [], read = new Set();
  for (const line of r.stdout.split(/\r?\n/).filter(Boolean)) {
    const [i, kind, sid, rights] = line.split('|');
    const where = rel(targets[Number(i)]) || '.';
    if (kind === 'owner') { read.add(i); if (OPEN_SIDS[sid]) open.push(`${where} 소유자 ${OPEN_SIDS[sid]}`); }
    else if (kind === 'Allow' && OPEN_SIDS[sid] && ((Number(rights) >>> 0) & WRITE_RIGHTS)) open.push(`${where} ${OPEN_SIDS[sid]} 쓰기`);
  }
  if (read.size !== targets.length) throw new Error(`클론 폴더 권한을 다 읽지 못함 (${read.size}/${targets.length}곳)`);
  if (open.length)
    throw new Error(`클론 폴더에 여럿이 쓰는 계정의 쓰기 권한이 있어 시작하지 않음 — ${[...new Set(open)].join(', ')}. ` +
                    '권한을 다시 좁힌다(계획 D8: Administrators · SYSTEM · 이 계정만)');
  log(`클론 폴더 권한: ${targets.map(t => rel(t) || '.').join(' · ')} — Everyone · Authenticated Users · Users 쓰기 권한 없음`);
}

// 봇 설정: scripts/brief-bot.settings.json(틀)의 {{ISO}} 를 오늘 날짜로, {{TOOL_GUARD}} 를 이 파일의 --tool-guard 훅 명령으로 채우고
// 매체 도메인마다 WebFetch(domain:<도메인>) · WebFetch(domain:*.<도메인>) 허용 규칙을 더해 logs/ 에 쓴다(에이전트가 쓸 수 없는 곳).
// 2.1.331 의 domain: 규칙은 호스트가 정확히 같을 때만 맞고, *.<도메인> 은 하위 도메인에만(그 도메인 자체는 아님) 맞는다
// (claude.exe 코드로 확인). 틀은 reset 뒤의 클론 것(= origin/main)을 읽는다.
function writeSettings(domains) {
  const fwd = p => p.replaceAll('\\', '/');   // 훅 명령은 셸이 읽으므로 \ 대신 / 로
  const guard = `"${fwd(process.execPath)}" "${fwd(fileURLToPath(import.meta.url))}" --tool-guard`;
  const text = readRepoText('scripts/brief-bot.settings.json')
    .replaceAll('{{ISO}}', ISO)
    .replaceAll('{{TOOL_GUARD}}', JSON.stringify(guard).slice(1, -1));
  // claude -p 는 형식이 틀린 설정 파일을 말없이 버리고 돈다(허용 · 거부 규칙과 훅 없이). 그러기 전에 여기서 멈춘다.
  let settings;
  try { settings = JSON.parse(text); } catch (e) { throw new Error(`봇 설정 틀이 JSON 이 아님: ${e.message}`); }
  const allow = settings.permissions.allow;
  // WebFetch 허용은 목록으로만 만든다 — 틀에 도메인 없는 "WebFetch" 같은 규칙이 있으면 모든 주소가 열린다.
  if (allow.some(rule => /^WebFetch\b/.test(rule))) throw new Error('봇 설정 틀에 WebFetch 허용 규칙이 있음 — WebFetch 규칙은 매체 도메인 목록으로만 만든다');
  allow.push(...domains.flatMap(d => [`WebFetch(domain:${d})`, `WebFetch(domain:*.${d})`]));
  const file = path.join(LOGS, `${STAMP}-settings.json`);
  fs.writeFileSync(file, JSON.stringify(settings, null, 2) + '\n');
  log(`봇 설정 ${rel(file)} — 쓰기 허용 briefings/epl-news-${ISO}-*.html · briefings.js · tmp-brief/** · ` +
      `WebFetch 허용 ${DOMAINS_FILE} 의 도메인 ${domains.length}개와 그 하위 도메인`);
  return file;
}

// claude -p 를 셸 없이 claude.exe 로 직접 실행한다(시간 초과 때 본체와 자식까지 죽이려고). 실패면 예외.
async function runClaude(opt, settingsFile) {
  const prompt = `ROUTINE.md의 '무인 실행' 절과 0~6 · 8절대로 오늘(${ISO}) 브리핑을 만들어라.`;
  const args = ['-p', prompt, '--model', opt.model, '--effort', opt.effort,
    '--setting-sources', 'project',          // 전역 설정(effort=max · 권한 기본값 auto · 훅 · 플러그인 · additionalDirectories)을 뺀다
    '--settings', settingsFile, '--permission-mode', 'dontAsk', '--strict-mcp-config', '--tools', TOOLS,
    '--output-format', 'json'];
  if (!opt.claudeScript && !fs.existsSync(CLAUDE_EXE)) throw new Error(`claude.exe 가 없음: ${CLAUDE_EXE}`);
  const [cmd, cmdArgs] = opt.claudeScript ? [process.execPath, [opt.claudeScript, ...args]] : [CLAUDE_EXE, args];
  log(`claude 시작: ${cmd}${opt.claudeScript ? ' ' + opt.claudeScript : ''} ${args.slice(2).join(' ')}\n    프롬프트: ${prompt}`);
  const r = await run(cmd, cmdArgs, { env: claudeEnv(), timeoutMs: opt.timeoutMin * 60 * 1000 });
  const raw = path.join(LOGS, `${STAMP}-claude.json`);
  fs.writeFileSync(raw, r.stdout);
  if (r.stderr.trim()) fs.writeFileSync(path.join(LOGS, `${STAMP}-claude-stderr.txt`), r.stderr);
  if (r.timedOut) throw new Error(`claude 시간 초과 (${opt.timeoutMin}분) — taskkill /T /F 로 프로세스 트리를 죽임 (taskkill 종료 코드 ${r.killStatus})`);
  if (r.error) throw new Error(`claude 를 실행하지 못함: ${r.error.message}`);
  log(`claude 끝: 종료 코드 ${r.code} · 원문 ${rel(raw)}${r.stderr.trim() ? ' · stderr 있음' : ''}`);
  const res = parseResult(r.stdout);
  if (!res) throw new Error(`claude 결과 JSON 을 읽지 못함 (종료 코드 ${r.code}): ${oneLine(r.stderr || r.stdout)}`);
  logResult(res);
  if (res.is_error || res.subtype !== 'success' || r.code !== 0)
    throw new Error(`claude 가 실패로 끝남 (is_error ${res.is_error} · subtype ${res.subtype} · 종료 코드 ${r.code})`);
  const why = modelProblem(res.modelUsage, opt.model);
  if (why) throw new Error(why);
}

// 자식 claude 의 환경. ANTHROPIC_API_KEY 를 지워 구독 인증을 쓰게 하고(있으면 API 과금으로 바뀐다), CLAUDE* 변수도 지운다 —
// Claude Code 세션 안에서 이 스크립트를 돌리면 그 세션의 CLAUDE_CODE_EFFORT_LEVEL=max(전역 설정 env, --effort 보다 우선)와
// 세션 연결 정보가 넘어오기 때문이다. CLAUDE.md 는 하나도 읽지 않게 한다 — 클론 위 폴더의 CLAUDE.md 도 읽히므로(예: 홈 아래에
// 클론을 두면 ~/.claude/CLAUDE.md 의 개인 지시가 섞인다). 루틴은 프롬프트로 ROUTINE.md 를 읽는다.
function claudeEnv() {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) {
    const K = k.toUpperCase();
    if (K === 'ANTHROPIC_API_KEY' || (K.startsWith('CLAUDE') && !KEEP_CLAUDE_ENV.has(K))) continue;
    env[k] = v;
  }
  env.CLAUDE_CODE_DISABLE_CLAUDE_MDS = '1';
  return env;
}

// --output-format json 의 결과 한 덩어리. 앞에 다른 줄이 섞여 있으면 마지막 { 줄을 본다.
function parseResult(text) {
  for (const s of [text, text.trim().split('\n').at(-1)]) {
    try {
      const j = JSON.parse(s);
      if (j?.type === 'result') return j;
    } catch { /* 다음 후보 */ }
  }
  return null;
}

// 결과 요약을 로그에. 루틴 보고 · 거부된 도구 입력은 에이전트가 쓴 글자라 log() 가 제어 · 양방향 문자를 지우고 이메일 꼴을 가린다.
function logResult(res) {
  const u = res.usage ?? {};
  log(`claude 결과: is_error ${res.is_error} · subtype ${res.subtype} · 턴 ${res.num_turns} · ${seconds(res.duration_ms)} · ` +
      `비용(추정) $${res.total_cost_usd} · 토큰 입력 ${u.input_tokens} / 캐시 쓰기 ${u.cache_creation_input_tokens} / ` +
      `캐시 읽기 ${u.cache_read_input_tokens} / 출력 ${u.output_tokens} · 웹 검색 ${u.server_tool_use?.web_search_requests ?? 0}회`);
  for (const [m, v] of Object.entries(res.modelUsage ?? {}))
    log(`  실제 모델 ${m}: 입력 ${v.inputTokens} · 캐시 쓰기 ${v.cacheCreationInputTokens} · 캐시 읽기 ${v.cacheReadInputTokens} · ` +
        `출력 ${v.outputTokens} · $${v.costUSD}`);
  const denials = res.permission_denials ?? [];
  log(`  거부된 도구 ${denials.length}건` + denials.map(d => `\n    ${d.tool_name} ${oneLine(JSON.stringify(d.tool_input), 300)}`).join(''));
  log(`  루틴 보고(result):\n${indent(String(res.result ?? '(없음)'))}`);
}

// 실제 쓰인 모델(modelUsage)이 요청과 다르면 이유를, 같으면 null. 출력이 가장 많은 모델(본 작업)이 요청 모델이어야 하고,
// 요청 모델도 haiku 도 아닌 모델이 끼어 있으면(도중에 다른 모델로 바뀜) 실패. haiku 는 Claude Code 가 보조 일에 쓸 수 있어 봐준다.
// 요청은 별칭(opus)이든 전체 이름(claude-opus-…)이든 모델 이름에 들어 있으면 같은 것으로 본다.
function modelProblem(usage, requested) {
  const want = requested.replace(/\[.*\]$/, '').toLowerCase();
  const isWanted = name => name.toLowerCase().includes(want);
  const names = Object.keys(usage ?? {});
  if (!names.length) return '결과에 modelUsage 가 없어 실제 모델을 알 수 없음';
  const main = names.reduce((a, b) => ((usage[b].outputTokens ?? 0) > (usage[a].outputTokens ?? 0) ? b : a));
  if (!isWanted(main)) return `실제 모델 ${main} 이 요청(${requested})과 다름`;
  const others = names.filter(n => !isWanted(n) && !/haiku/i.test(n));
  if (others.length) return `요청(${requested}) 말고 다른 모델도 쓰임: ${others.join(', ')}`;
  return null;
}

// push 전 검사 — 하나라도 걸리면 예외(커밋 · push 안 함). 순서: 바뀐 파일 → 검사기(HTML · briefings.js) → 지난 항목 · 첫 항목 →
// headline 의 제어 · 양방향 문자 → 새 HTML 의 링크. (이메일 주소 꼴은 커밋 메시지를 만든 뒤 checkEmails 가 본다.)
// 바뀐 파일을 맨 먼저 보는 까닭: 그다음 검사기는 클론의 scripts/ 를 실행하므로 scripts/ 가 그대로인지부터 확인한다.
async function checkOutput(teams, baseList, repo, domains) {
  const fileOf = t => `briefings/epl-news-${ISO}-${t}.html`;
  const want = new Map(teams.map(t => [fileOf(t), '??']));   // 팀마다 새 파일(추적 안 됨)
  want.set('briefings.js', ' M');                             // 고친 파일
  const changed = await changedFiles();
  const extra = changed.filter(e => want.get(e.path) !== e.xy);
  const missing = [...want.keys()].filter(p => !changed.some(e => e.path === p));
  if (extra.length) throw new Error(`검사: 바뀌면 안 되는 파일 — ${showChanges(extra)}`);
  if (missing.length) throw new Error(`검사: 만들어지지 않은 파일 — ${missing.join(', ')}`);
  log(`검사: 바뀐 파일 = 오늘 브리핑 ${teams.length}개 + briefings.js — 통과`);

  const files = [...want.keys()];
  const htmlFiles = files.filter(f => f.endsWith('.html'));
  for (const f of htmlFiles) await checker([f]);
  await checker(['--index', '--date', ISO]);   // briefings.js 가 데이터뿐인지(코드 없음) · 항목 모양 · 첫 항목 = 오늘

  const list = repo.readJsonAssignment('briefings.js', 'HUB_BRIEFINGS');
  if (!isDeepStrictEqual(list.slice(1), baseList))
    throw new Error('검사: briefings.js 의 지난 항목이 origin/main 과 다름 (오늘 항목 말고는 바꾸면 안 됨)');
  const entry = list[0];
  const keys = Object.keys(entry.files ?? {});
  if (entry.date !== ISO || keys.length !== teams.length || !teams.every(t => entry.files?.[t]?.file === fileOf(t)))
    throw new Error(`검사: briefings.js 첫 항목이 오늘 만든 파일들과 다름 — ${oneLine(JSON.stringify(entry), 300)}`);
  log('검사: briefings.js 지난 항목 그대로 · 첫 항목 = 오늘 만든 파일들 — 통과');

  // headline 은 공개 커밋 메시지와 로그 · 콘솔로 가는 글자다. 공백(줄바꿈 · 탭 포함)은 커밋 메시지에서 한 칸으로 줄이므로 괜찮고,
  // 그 밖의 제어 · 양방향 문자는 커밋 기록과 터미널 화면을 속일 수 있어 push 안 함(지우지 않는다 — 정상 기사 제목에는 나오지 않는다).
  for (const t of teams) {
    const bad = [...new Set([...entry.files[t].headline.replace(/\s+/g, ' ')].filter(c => CONTROL.test(c)))];
    if (bad.length) throw new Error(`검사: ${t} 의 headline 에 제어 · 양방향 문자 ${bad.map(codePoint).join(' ')} — push 안 함`);
  }
  // 새 HTML 의 링크 — 기사 페이지로 열 수 없는 곳(매체 도메인 목록 밖)으로 보내거나 링크 주소에 담아 내보내는 길을 막는다.
  for (const f of htmlFiles) {
    const bad = linkProblems(readRepoText(f), domains);
    if (bad.length) throw new Error(`검사: ${f} 에 매체 도메인 목록 밖 링크 — ${[...new Set(bad)].join(', ')}`);
  }
  log('검사: headline 에 제어 · 양방향 문자 없음 · 새 HTML 의 링크 = 사이트 안 · 매체 도메인 — 통과');
  return { files, entry };
}

// node scripts/check-briefing.mjs <인자> — 출력은 로그에 그대로, 종료 코드가 0 이 아니면 예외.
async function checker(args) {
  const r = await run(process.execPath, ['scripts/check-briefing.mjs', ...args], { timeoutMs: STEP_TIMEOUT_MS });
  const out = (r.stdout + r.stderr).trim();
  log(`검사: check-briefing ${args.join(' ')} → 종료 코드 ${r.code}${out ? '\n' + indent(out) : ''}`);
  if (r.code !== 0) throw new Error(`검사: check-briefing ${args.join(' ')} 실패 (종료 코드 ${r.code})`);
}

// 새 HTML 의 <a href> 가운데 사이트 밖으로 가는 것이 https 이고 매체 도메인 목록(과 그 하위 도메인)인지. 문제마다 "스킴//호스트"
// 한 줄(주소 전체는 적지 않는다). 카드의 a.go 만이 아니라 모든 <a> 를 본다(검사기는 a.go 가 https 인지만 본다). 브라우저처럼
// 문자 참조를 푼 뒤 URL 로 해석하고(&period; 로 호스트를 바꾸는 꼴 등), 모르는 문자 참조가 남으면 해석을 믿을 수 없어 문제로 본다.
// 썸네일 img src 는 보지 않는다(CDN 이 제각각).
function linkProblems(html, domains) {
  const SITE = 'https://site.invalid/briefings/page.html';   // 상대 주소를 풀 기준 — 사이트 안 주소는 호스트가 이것이 된다
  const bad = [];
  for (const [tag] of html.matchAll(/<a(?=[\s\/>])(?:"[^"]*"|'[^']*'|[^"'>])*>/gi)) {
    const href = attr(tag, 'href');
    if (href === undefined) continue;
    const decoded = decodeRefs(href);
    let u = null;
    if (!/&[a-z][a-z0-9]*;/i.test(decoded)) {
      try { u = new URL(decoded, SITE); } catch { /* 아래에서 문제로 */ }
    }
    if (u?.hostname === 'site.invalid') continue;
    if (u?.protocol === 'https:' && isListedHost(u.hostname, domains)) continue;
    bad.push(u ? `${u.protocol}//${u.hostname}` : '해석할 수 없는 주소');
  }
  return bad;
}

// 이메일 주소 꼴 검사 (계획 D7) — 무인 세션 문맥에 계정 이메일이 있어서, 기사 속 주입이 그것을 공개 브리핑 · 커밋으로 내보내지
// 못하게 한다. 새 HTML(숨긴 글자를 드러낸 뒤, 태그를 지운 글자로도 한 번 더) · briefings.js 오늘 항목의 글자 값 · 커밋 메시지를
// 줄마다 본다. 하나라도 있으면 push 안 함. 로그에는 위치만 적는다(주소는 적지 않는다).
function checkEmails(files, entry, message) {
  const found = [];
  const scan = (where, text) => text.split('\n').forEach((line, i) => {
    const t = revealText(line);
    if (EMAIL.test(t) || EMAIL.test(t.replace(/<[^>]*>/g, ''))) found.push(`${where} ${i + 1}번째 줄`);
  });
  for (const f of files.filter(f => f.endsWith('.html'))) scan(f, readRepoText(f));
  for (const [where, value] of stringValues(entry, 'briefings.js 오늘 항목')) scan(where, value);
  scan('커밋 메시지', message);
  if (found.length) throw new Error(`검사: 이메일 주소 꼴 — ${found.join(', ')} (주소는 로그에 적지 않음)`);
  log('검사: 새 HTML · briefings.js 오늘 항목 · 커밋 메시지에 이메일 주소 꼴 없음 — 통과');
}

// ROUTINE.md 7절 형식: 제목 brief: <ISO>, 본문은 팀마다 "<짧은 이름>: <그 팀 headline 첫 덩어리>"(HUB.meta.teams 순서)와
// "리그: <headline 두 번째 덩어리>". headline 은 에이전트가 쓴 글이라 줄바꿈 · 연속 공백을 한 칸으로 줄여 한 줄로 만든다
// (그 밖의 제어 · 양방향 문자는 checkOutput 에서 이미 걸렀다).
function commitMessage(entry, teams, names) {
  const chunks = t => String(entry.files[t].headline).replace(/\s+/g, ' ').trim().split(' · ');
  const lines = teams.map(t => `${names[t]}: ${chunks(t)[0]}`);
  const league = teams.map(t => chunks(t)[1]).find(Boolean);
  if (league) lines.push(`리그: ${league}`);
  else log('headline 에 두 번째 덩어리(리그 소식)가 없어 커밋 본문에서 리그 줄을 뺌');
  return `brief: ${ISO}\n\n${lines.join('\n')}\n`;
}

// 커밋 본문의 팀 이름: ROUTINE.md 0-C 표의 짧은 이름(맨유 · 토트넘), 표에 없으면 clubs.js 의 한국어명, 그것도 없으면 팀 키.
function teamShortNames(teams, routine, clubs) {
  const section = routine.split(/^### /m).find(s => s.startsWith('0-C')) ?? '';
  const table = {};   // 표 줄: | `팀키` … | 배지 | 짧은 이름 | 한국어명 | 색 |
  for (const m of section.matchAll(/^\|\s*`([a-z0-9-]+)`[^|\n]*\|[^|\n]*\|\s*([^|\n]*?)\s*\|/gm)) table[m[1]] = m[2];
  return Object.fromEntries(teams.map(t => [t, table[t] || clubs[t]?.ko || t]));
}

// pull --rebase → 올릴 것 확인 → push. 거부되면 한 번만 fetch → rebase → push 를 다시 한다.
async function push(files) {
  await rebase(['pull', '--rebase', '-q', 'origin', 'main']);
  for (let attempt = 1; ; attempt++) {
    await checkOutgoing(files);
    const r = await git(['push', '-q', 'origin', 'main'], { net: true, allowFail: true });
    if (r.code === 0) { log(`push 성공 (${attempt}번째) — origin/main = ${await head()}`); return; }
    log(`push 실패 (${attempt}번째): ${oneLine(r.stderr || r.stdout)}`);
    if (attempt === 2) throw new Error(`push 가 다시 해도 실패 — 로컬 커밋 ${await head()} 은 다음 실행의 reset 에서 사라진다`);
    await git(['fetch', '-q', 'origin'], { net: true });
    await rebase(['rebase', '-q', 'origin/main']);
  }
}

// rebase(또는 pull --rebase). 충돌 등으로 실패하면 rebase --abort 하고 예외.
async function rebase(args) {
  const r = await git(args, { net: args[0] === 'pull', allowFail: true });
  if (r.code !== 0) {
    await git(['rebase', '--abort'], { allowFail: true });
    throw new Error(`git ${args.join(' ')} 실패 — rebase --abort 함: ${oneLine(r.stderr || r.stdout)}`);
  }
  log(`git ${args.join(' ')} — 성공 (HEAD ${await head()})`);
}

// rebase 뒤 마지막 확인: origin/main 위에 올라갈 것이 오늘 브리핑 커밋 하나이고 그 파일들뿐인지.
async function checkOutgoing(files) {
  const count = (await git(['rev-list', '--count', 'origin/main..HEAD'])).stdout.trim();
  const names = (await git(['diff', '--name-only', '-z', 'origin/main', 'HEAD'])).stdout.split('\0').filter(Boolean);
  if (count !== '1' || names.sort().join('\n') !== [...files].sort().join('\n'))
    throw new Error(`올릴 것이 오늘 브리핑 커밋 하나가 아님 (커밋 ${count}개 · 파일 ${names.join(', ')})`);
}

// 실패로 끝날 때(claude 를 돌린 뒤): 바뀐 파일을 logs/<STAMP>-rejected/ 에 복사해 두고 클론을 HEAD 로 되돌린다.
// 다음 실행은 작업 트리의 scripts/brief-bot.mjs 를 reset 전에 실행하므로, 이번 실행이 남긴 변경을 그대로 두지 않는다.
async function keepRejectedAndRestore() {
  const changed = await changedFiles();
  if (changed.length) {
    const dir = path.join(LOGS, `${STAMP}-rejected`);
    for (const { path: p } of changed) {
      if (!fs.lstatSync(path.join(CLONE, p), { throwIfNoEntry: false })?.isFile()) continue;   // 지운 파일 등
      fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true });
      fs.copyFileSync(path.join(CLONE, p), path.join(dir, p));
    }
    log(`바뀐 파일 ${changed.length}개를 ${rel(dir)}/ 에 보관: ${showChanges(changed)}`);
  }
  await git(['reset', '-q', '--hard', 'HEAD']);
  await git(['clean', '-q', '-fd']);
  log('클론을 HEAD 로 되돌림 (reset --hard · clean -fd)');
}

// git status 의 바뀐 파일 [{ xy, path }]. -z 라 경로를 따옴표로 감싸지 않는다. 무시 대상(logs/ · tmp-brief/ 등)은 나오지 않는다.
async function changedFiles() {
  const parts = (await git(['status', '--porcelain', '-z', '--untracked-files=all'])).stdout.split('\0');
  const changes = [];
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i]) continue;
    const xy = parts[i].slice(0, 2);
    changes.push({ xy, path: parts[i].slice(3) });
    if (xy[0] === 'R' || xy[0] === 'C') i++;   // 이름 바꾸기 · 복사는 다음 칸이 옛 경로
  }
  return changes;
}

// 봇이 남길 수 있는 변경(지난 실행이 도중에 죽은 경우): 새 브리핑 HTML, 고친 briefings.js.
function leftoverOfBot(e) {
  return (e.xy === '??' && /^briefings\/epl-news-\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.html$/.test(e.path)) ||
         (e.xy === ' M' && e.path === 'briefings.js');
}

// git 을 클론에서 실행한다. net = 원격과 통신(시간 제한이 더 김). 실패하면 예외, allowFail 이면 결과를 그대로 돌려준다.
async function git(args, { net = false, allowFail = false } = {}) {
  const r = await run('git', args, { env: GIT_ENV, timeoutMs: net ? GIT_NET_TIMEOUT_MS : STEP_TIMEOUT_MS });
  if (r.code !== 0 && !allowFail)
    throw new Error(`git ${args.join(' ')} 실패 (${r.timedOut ? '시간 초과' : r.error ? r.error.message : '종료 코드 ' + r.code}): ` +
                    oneLine(r.stderr || r.stdout));
  return r;
}

async function head() { return (await git(['rev-parse', '--short', 'HEAD'])).stdout.trim(); }

// 자식 프로세스 하나를 셸 없이 실행해 { code, stdout, stderr, timedOut, killStatus, error } 를 돌려준다(예외 없음).
// 시간 제한을 넘으면 taskkill /T /F 로 자식의 자식까지 죽인다(claude.exe 가 띄운 셸 · node 가 고아로 남지 않게).
function run(cmd, args, { env = process.env, timeoutMs }) {
  return new Promise(resolve => {
    const r = { code: null, stdout: '', stderr: '', timedOut: false, killStatus: null, error: null };
    const child = spawn(cmd, args, { cwd: CLONE, env, shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.setEncoding('utf8').on('data', d => (r.stdout += d));
    child.stderr.setEncoding('utf8').on('data', d => (r.stderr += d));
    let done = false;
    const finish = () => { if (!done) { done = true; clearTimeout(timer); resolve(r); } };
    const timer = setTimeout(() => {
      r.timedOut = true;
      r.killStatus = spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }).status;
    }, timeoutMs);
    child.on('error', e => { r.error = e; finish(); });   // 실행 파일이 없음 등
    child.on('close', code => { r.code = code; finish(); });
    // 프로세스는 끝났는데 그 자식이 출력 파이프를 붙잡고 있으면 close 가 오지 않는다 — 10초 기다리고 끝낸다.
    child.on('exit', code => setTimeout(() => { r.code ??= code; child.stdout.destroy(); child.stderr.destroy(); finish(); }, 10_000).unref());
  });
}

// ── 매체 도메인 목록 · 글자 다루기
// 매체 도메인 목록(scripts/brief-domains.json): {"media":[{"name":"BBC Sport","domains":["bbc.com","bbc.co.uk"]}, …]}.
// 코드로 실행하지 않고 JSON 으로 읽는다. 도메인은 소문자 이름.이름 꼴만(* · 포트 · 경로 · IP 없이) — 설정 규칙 글자에 그대로 넣으므로
// 꼴이 틀리면 실패. brief-fetch.mjs 도 같은 꼴로 읽는다.
function readDomains(file) {
  const domains = JSON.parse(fs.readFileSync(file, 'utf8')).media.flatMap(m => m.domains);
  if (!domains.length || !domains.every(d => typeof d === 'string' && /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/.test(d)))
    throw new Error(`매체 도메인 목록 ${DOMAINS_FILE} 의 도메인 꼴이 틀림 (소문자 이름.이름 — * · 포트 · 경로 · IP 없이)`);
  return domains;
}
// 호스트가 목록의 도메인이거나 그 하위 도메인인지 — 점 경계로 본다(bbc.com.evil.example · evilbbc.com 은 아니다).
function isListedHost(host, domains) { return domains.some(d => host === d || host.endsWith('.' + d)); }

// 시작 태그 하나의 속성 값(적힌 그대로). 같은 이름이 두 번이면 처음 것(브라우저와 같음). 없으면 undefined.
function attr(tag, name) {
  for (const m of tag.slice(1).matchAll(/([^\s=<>\/"']+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g))
    if (m[1].toLowerCase() === name) return m[2] ?? m[3] ?? m[4];
  return undefined;
}
// HTML 문자 참조 풀기 — 숫자 참조 전부와 NAMED_REFS 의 이름 참조. 모르는 이름 참조는 그대로 둔다.
function decodeRefs(s) {
  const ch = n => (n <= 0x10ffff ? String.fromCodePoint(n) : '');
  return s.replace(/&#x([0-9a-f]+);?|&#(\d+);?|&([a-z][a-z0-9]*);/gi,
    (m, hex, dec, name) => (hex ? ch(parseInt(hex, 16)) : dec ? ch(Number(dec)) : NAMED_REFS[name.toLowerCase()] ?? m));
}
// 숨긴 글자 드러내기 — 문자 참조 · URL 의 %XX 를 풀고, 보이지 않는 서식 문자(\p{Cf}, 예: 폭 없는 공백)를 지우고, 전각 글자를 반각으로(NFKC).
function revealText(s) {
  return decodeRefs(s).replace(/%([0-9a-f]{2})/gi, (_, x) => String.fromCharCode(parseInt(x, 16)))
    .replace(/\p{Cf}/gu, '').normalize('NFKC');
}
// 값 안의 글자를 모두 [위치, 글자] 로 (객체 · 배열은 안으로 들어간다).
function* stringValues(v, at) {
  if (typeof v === 'string') yield [at, v];
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) yield* stringValues(x, `${at}.${k}`);
}
function codePoint(c) { return 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'); }

// ── 작은 도구들
// 로그 · 콘솔에 쓰는 글자에는 에이전트가 쓴 글자(루틴 보고 · 거부된 도구 입력 · 검사기 출력 · 파일 이름)가 섞인다 — 줄바꿈 · 탭 말고
// 제어 · 양방향 문자(\p{Cc} · \p{Cf} — 터미널 이스케이프 · 글자 방향 뒤집기)를 지우고 이메일 주소 꼴을 가린다.
function log(msg) {
  const text = String(msg).replace(/(?![\n\t])[\p{Cc}\p{Cf}]/gu, '').replace(new RegExp(EMAIL.source, 'g'), '<이메일 꼴 가림>');
  const line = `[${kstTime(new Date())}] ${text}`;
  fs.appendFileSync(LOG_FILE, line + '\n');
  console.log(line);
}
function readRepoText(name) { return fs.readFileSync(path.join(CLONE, name), 'utf8'); }
function kstDate(d) { return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(d); }               // YYYY-MM-DD
function kstTime(d) { return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', timeStyle: 'medium' }).format(d); }   // HH:MM:SS
function elapsed(start) { const s = Math.round((Date.now() - start) / 1000); return `${Math.floor(s / 60)}분 ${s % 60}초`; }
function seconds(ms) { return ms == null ? '시간 ?' : `${Math.round(ms / 1000)}초`; }
function rel(p) { return path.relative(CLONE, p).replaceAll('\\', '/'); }
function indent(text) { return text.split('\n').map(l => (l.trim() ? '    ' + l : '')).join('\n'); }
function oneLine(s, max = 500) { const t = String(s).replace(/\s+/g, ' ').trim(); return t.length > max ? t.slice(0, max) + '…' : t; }
function showChanges(changes) { return changes.map(e => `${e.xy.trim()} ${e.path}`).join(', '); }
