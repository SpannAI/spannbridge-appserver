import { spawn } from 'node:child_process';
import { existsSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { delimiter, dirname, extname, join, resolve } from 'node:path';

export const VERSION = '1.0';
export function isEntryPoint(url) {
  return Boolean(process.argv[1]) && realpathSync(fileURLToPath(url)) === realpathSync(process.argv[1]);
}

export async function stopGracefully(child, graceMs = 3000) {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null) return;
  await new Promise((done) => {
    const finish = () => { clearTimeout(timer); child.off('close', finish); done(); };
    const timer = setTimeout(finish, graceMs);
    child.once('close', finish);
    if (child.connected) child.send({ type: 'shutdown' }, () => {});
    else if (process.platform !== 'win32') child.kill('SIGTERM');
  });
  await stopProcessTree(child);
}

// Use native executables or npm's JS entry, never Windows script shims.
export function resolveCLI(override = process.env.CODEX_BIN, env = process.env) {
  const names = process.platform === 'win32' ? ['codex.exe', 'codex.cmd', 'codex.ps1'] : ['codex'];
  const onPath = (name) => (env.Path || env.PATH || '').split(delimiter)
    .filter(Boolean).map((dir) => join(dir.replace(/^"|"$/g, ''), name));
  let candidates = override ? [resolve(override), ...onPath(override)] : names.flatMap(onPath);
  if (!override) {
    if (env.APPDATA) candidates.push(join(env.APPDATA, 'npm', 'codex.cmd'));
    if (env.LOCALAPPDATA) {
      const root = join(env.LOCALAPPDATA, 'OpenAI', 'Codex', 'bin');
      if (existsSync(root)) candidates.push(...readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => join(root, entry.name, 'codex.exe'))
        .filter(existsSync).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs));
    }
  }
  for (const candidate of candidates) {
    if (!existsSync(candidate) || !statSync(candidate).isFile()) continue;
    const extension = extname(candidate).toLowerCase();
    if (['.cmd', '.ps1', '.js', '.mjs'].includes(extension)) {
      const entry = ['.js', '.mjs'].includes(extension) ? candidate
        : join(dirname(candidate), 'node_modules', '@openai', 'codex', 'bin', 'codex.js');
      if (existsSync(entry)) return { file: process.execPath, args: [entry], kind: 'JavaScript CLI' };
    } else if (extension === '.exe' || process.platform !== 'win32') {
      return { file: candidate, args: [], kind: 'native CLI' };
    }
  }
  throw new Error('No usable Codex CLI found. Install Node.js LTS, then run npm.cmd install -g @openai/codex. Reopen your terminal. Use --codex-path for a custom installation.');
}

export function childEnvironment(env = process.env) {
  return Object.fromEntries(Object.entries(env).filter(([name]) => {
    const key = name.toUpperCase();
    if (['CODEX_HOME', 'CODEX_CA_CERTIFICATE'].includes(key)) return true;
    return !/^(OPENAI_|CODEX_|COMSOL_|ADAPTER_|ANTHROPIC_|CLAUDE_)/.test(key)
      && !['NODE_OPTIONS', 'NODE_PATH', 'ELECTRON_RUN_AS_NODE'].includes(key);
  }));
}

export async function stopProcessTree(child) {
  if (!child?.pid) return;
  let treeStopped = false;
  // Kill descendants while their parent still exists, so taskkill can find them.
  if (process.platform === 'win32' && child.exitCode === null && child.signalCode === null) {
    await new Promise((done) => {
      const killer = spawn(join(process.env.SystemRoot || process.env.WINDIR, 'System32', 'taskkill.exe'),
        ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
      const timer = setTimeout(() => { killer.kill(); done(); }, 5000);
      killer.once('error', () => { clearTimeout(timer); done(); });
      killer.once('close', (code) => { treeStopped = code === 0; clearTimeout(timer); done(); });
    });
  }
  if (child.exitCode !== null || child.signalCode !== null) return;
  await new Promise((done) => {
    const timer = setTimeout(() => { try { child.kill('SIGKILL'); } catch { /* Already exited. */ } done(); }, 2000);
    child.once('close', () => { clearTimeout(timer); done(); });
    if (!treeStopped) {
      try { child.kill(); } catch { /* taskkill may finish before the exit notification arrives. */ }
    }
  });
}

export function runCLI(launch, args, { inherit = false, timeout = 15000, cwd } = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(launch.file, [...launch.args, ...args], {
      windowsHide: true, cwd, env: childEnvironment(), stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    const collect = (data) => { output = (output + data).slice(-65536); };
    child.stdout?.on('data', collect);
    child.stderr?.on('data', collect);
    let timedOut = false;
    const timer = timeout ? setTimeout(async () => {
      timedOut = true;
      await stopProcessTree(child);
      reject(new Error('CLI check timed out. Check the selected installation and sign-in.'));
    }, timeout) : null;
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('close', (code) => { clearTimeout(timer); if (!timedOut) resolveRun({ code, output }); });
  });
}

export function parseOptions(argv, allowed) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, '');
    if (!argv[i].startsWith('--') || !allowed.includes(key)) throw new Error(`Unknown option: ${argv[i]}`);
    if (['check-only', 'help'].includes(key)) options[key] = true;
    else {
      const value = argv[++i];
      if (value === undefined || value.startsWith('--')) throw new Error(`--${key} requires a value.`);
      options[key] = value;
    }
  }
  return options;
}

export function integerOption(value, fallback, min, max, name) {
  const result = Number(value ?? fallback);
  if (!Number.isInteger(result) || result < min || result > max) throw new Error(`${name} must be an integer from ${min} through ${max}.`);
  return result;
}
