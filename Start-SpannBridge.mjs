import { spawn } from 'node:child_process';
import net from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { integerOption, isEntryPoint, parseOptions, resolveCLI, runCLI, stopGracefully, stopProcessTree } from './cli.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export async function checkPort(port) {
  await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', () => reject(new Error(`Port ${port} is unavailable. Stop the other edition or use --port 8766.`)));
    probe.listen(port, '127.0.0.1', () => probe.close(resolve));
  });
}

export async function main(argv = process.argv.slice(2)) {
  let passthrough = -1;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === 'codex') { passthrough = i; break; }
    if (argv[i].startsWith('--') && !['--help', '--check-only'].includes(argv[i])) i++;
  }
  const options = parseOptions(passthrough < 0 ? argv : argv.slice(0, passthrough),
    ['check-only', 'help', 'port', 'token', 'model', 'effort', 'timeout-seconds', 'codex-path']);
  if (options.help) {
    console.log('node Start-SpannBridge.mjs [--check-only] [--port 8765] [--token VALUE] [--model ID] [--effort low] [--timeout-seconds 240] [--codex-path FILE]\nnode Start-SpannBridge.mjs [--codex-path FILE] codex login [status|--device-auth]');
    return;
  }
  if (Number(process.versions.node.split('.')[0]) < 18) throw new Error('Node.js 18 or newer is required. Install a supported LTS release.');
  const launch = resolveCLI(options['codex-path']);
  if (passthrough >= 0) {
    const result = await runCLI(launch, argv.slice(passthrough + 1), { inherit: true, timeout: 0 });
    process.exitCode = result.code ?? 1;
    return;
  }
  const port = integerOption(options.port, 8765, 1, 65535, '--port');
  const token = options.token?.trim() || '';
  const timeout = integerOption(options['timeout-seconds'], 240, 1, 3600, '--timeout-seconds');
  const effort = options.effort ?? 'low';
  if (!['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max', 'ultra'].includes(effort)) throw new Error('Unknown --effort value. See README.md.');
  console.log(`Using ${launch.kind}.`);
  if ((await runCLI(launch, ['--version'])).code !== 0) throw new Error('CLI version check failed. Reinstall the selected CLI.');
  if ((await runCLI(launch, ['app-server', '--help'])).code !== 0) throw new Error('The CLI has no usable app-server command. Update it through its installation channel.');
  const login = await runCLI(launch, ['login', 'status']);
  if (login.code !== 0 || !/logged in using chatgpt/i.test(login.output)) {
    throw new Error('ChatGPT sign-in is required. Run node Start-SpannBridge.mjs codex login, then codex login status through the same launcher. Add --device-auth if needed.');
  }
  await checkPort(port);
  console.log('PASS: ready to start.  Node.js, CLI, app-server command, ChatGPT sign-in, and port checked.  No completion sent.');
  if (options['check-only']) return;
  console.log(`Base URL: http://127.0.0.1:${port}/v1\nModel id: ${process.env.ADAPTER_DEFAULT_MODEL || 'default'}\nTool calling: off\nLocal API key: ${token ? 'required' : 'not required (leave the API key blank)'}\nLeave this window open.  Press Ctrl+C to stop.`);
  const child = spawn(process.execPath, [join(HERE, 'adapter.mjs')], {
    cwd: HERE, windowsHide: true, stdio: ['inherit', 'inherit', 'inherit', 'ipc'], env: {
      ...process.env, ADAPTER_PORT: String(port), ADAPTER_TOKEN: token,
      ADAPTER_MODEL: options.model || '', ADAPTER_EFFORT: effort,
      ADAPTER_TIMEOUT_MS: String(timeout * 1000),
      CODEX_BIN: launch.file, CODEX_BIN_ARGS_JSON: JSON.stringify(launch.args),
    },
  });
  let stopping;
  const stop = () => { stopping ??= stopGracefully(child); };
  const onMessage = (message) => { if (message?.type === 'shutdown') stop(); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  process.on('message', onMessage);
  try {
    await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('close', (code) => { process.exitCode = stopping ? 0 : code ?? 1; resolve(); });
    });
  } finally {
    process.off('SIGINT', stop);
    process.off('SIGTERM', stop);
    process.off('message', onMessage);
    await (stopping ?? stopProcessTree(child));
    if (process.connected) process.disconnect();
  }
}
if (isEntryPoint(import.meta.url)) {
  await main().catch((error) => { console.error(`ERROR: ${error.message}`); process.exitCode = 1; });
}
