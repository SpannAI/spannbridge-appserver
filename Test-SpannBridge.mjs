import { integerOption, isEntryPoint, parseOptions } from './cli.mjs';

export function expectedReply(answer) {
  return answer.trim().replace(/[.!?…]+$/, '').trim().toLowerCase() === 'adapter working';
}
export function completionTimeout(status, seconds) {
  return integerOption(seconds, (status.request_timeout_ms ?? 240000) / 1000, 1, 3600, '--timeout-seconds') * 1000 + 100000;
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseOptions(argv, ['check-only', 'help', 'port', 'token', 'model', 'timeout-seconds']);
  if (options.help) { console.log('node Test-SpannBridge.mjs [--check-only] [--port 8765] [--token VALUE] [--model default] [--timeout-seconds 240]'); return; }
  const port = integerOption(options.port, 8765, 1, 65535, '--port');
  let model = options.model || 'default';
  const base = `http://127.0.0.1:${port}`;
  const token = options.token?.trim() || '';
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const get = async (path) => {
    const response = await fetch(base + path, { headers, signal: AbortSignal.timeout(10000) });
    let body;
    try { body = await response.json(); } catch {
      throw new Error('Another program, possibly the Claude Code version, is using this port.  Its response is not adapter JSON.');
    }
    if (path === '/status' && !body.public_model) throw new Error('Another program, possibly the Claude Code version, is using this port.  Stop it or choose another port.');
    if (!response.ok) throw new Error(body.error?.message ?? body.error ?? `HTTP ${response.status}`);
    return body;
  };
  const status = await get('/status');
  model = options.model || status.public_model;
  if (status.status !== 'ok') throw new Error('Adapter status is not ok. Restart and read the adapter console.');
  const models = await get('/v1/models');
  if (!models.data.some((entry) => entry.id === model.split(':')[0])) throw new Error(`Model '${model}' is not listed. Choose an available ID.`);
  console.log(`Available model IDs: ${models.data.map((entry) => entry.id).join(', ')}`);
  for (const [alias, target] of Object.entries(status.model_aliases)) console.log(`  ${alias} -> ${target}`);
  if (options['check-only']) { console.log('PASS: status and model discovery. No completion sent.'); return; }
  console.log('Sending one real streaming completion. This uses your allowance.');
  const response = await fetch(base + '/v1/chat/completions', {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(completionTimeout(status, options['timeout-seconds'])),
    body: JSON.stringify({ model, stream: true, messages: [{ role: 'user', content: 'Reply with exactly: adapter working' }] }),
  });
  if (!response.ok) { const body = await response.json(); throw new Error(body.error?.message ?? body.error ?? `HTTP ${response.status}`); }
  let answer = '', usage, done = false;
  for (const line of (await response.text()).split(/\r?\n/)) {
    if (!line.startsWith('data: ')) continue;
    const payload = line.slice(6);
    if (payload === '[DONE]') { done = true; continue; }
    const event = JSON.parse(payload);
    if (event.error) throw new Error(event.error.message);
    answer += (event.choices || []).map((choice) => choice.delta?.content || '').join('');
    usage = event.usage || usage;
  }
  if (!expectedReply(answer) || !done || !(usage?.total_tokens > 0)) throw new Error('Reply, stream terminator, or token counts did not match.  Read the adapter console.');
  console.log('PASS: expected streaming reply and token counts.');
}
if (isEntryPoint(import.meta.url)) {
  await main().catch((error) => { console.error(`ERROR: ${error.message}`); process.exitCode = 1; });
}
