# Session-server integration notes

This document describes release 1.0 on 3 October 2026.  It explains the session-server pattern used by this edition of SpannBridge.

This repository is neither developed by nor endorsed by COMSOL AB, nor by OpenAI.  See *Publisher, trademarks, and affiliation* in README.md.  COMSOL® and COMSOL Multiphysics® are registered trademarks of COMSOL AB.  OpenAI, ChatGPT, and Codex are trademarks of OpenAI.

## 1. The session-server pattern

Pattern A starts a headless CLI process for each question.  Pattern B keeps one official session-server process running and starts a temporary conversation for each question.  This edition uses pattern B.

The Chatbot window in COMSOL Multiphysics® simulation software sends an OpenAI-compatible chat request to a loopback HTTP server.  SpannBridge translates that request into JSON-RPC messages for the official Codex App Server.

```
Chatbot → loopback HTTP → SpannBridge → JSON-RPC over stdio → session server
```

The Codex CLI manages sign-in.  SpannBridge does not read credential files or supply an API key to the provider.  `cli.mjs` removes inherited provider API-key variables and host overrides before it starts the Codex CLI.

The HTTP token, when configured, protects only SpannBridge on the local PC.  It is not a provider credential.  The launcher, `adapter.mjs`, and the test client trim surrounding whitespace.  A whitespace-only token turns authorization off.  Without a token, other programs on the same PC can call SpannBridge.

## 2. The protocol lifecycle

Read the [official App Server documentation](https://learn.chatgpt.com/docs/app-server) before changing protocol handling.  The installed Codex CLI can generate a JSON schema for its own protocol version.

1. Start one App Server process with piped stdin, stdout, and stderr.
2. Send `initialize` with the stable client name `spannbridge_appserver`.  Send `initialized` after the response.
3. Check `account/read` for ChatGPT sign-in.  Read the model catalog and effective configuration.
4. For each HTTP request, create an ephemeral thread.  Use `thread/start`, then `turn/start`.
5. Forward final-answer events and record usage.  Check the final turn status.
6. Interrupt failed, cancelled, or timed-out turns when a turn ID is known.  Unsubscribe from the thread and remove temporary images.

Match a response by ID only when the message has no `method` property.  Server requests and client calls can use the same ID.  Decline server approval requests instead of treating them as call results.

A failure notification can arrive before `turn/start` returns.  Attach the turn promise's rejection handler immediately.  Otherwise a legitimate upstream failure can become an unhandled rejection.

On process failure, reject pending calls promptly.  Do not mutate the rejected error in a request handler.  Each completion needs its own partial answer and usage snapshot.

## 3. Configuration and safety boundaries

SpannBridge supplies Java Shell guidance and asks the model not to use tools.  An instruction is not a security boundary.

Each thread requests read-only filesystem access and no command network access.  SpannBridge uses the `untrusted` approval policy and declines approval requests.  Unsupported settings must fail rather than trigger a less restrictive fallback.  Codex runs as the user's Windows account.  Tool-disabling settings are program options, not an operating-system sandbox.  The requested sandbox is a separate control, not a guarantee of complete isolation.

The thread configuration disables discovered MCP servers and plugins, app access, shell tools, unified execution, patch tools, delegation, and web search.  These settings depend on the version of the Codex CLI.  Review them after each update of the Codex CLI.

The Codex CLI still loads the user's configuration.  Do not claim that SpannBridge runs with a completely isolated home folder for the Codex CLI.  Authentication and settings that an organization manages still belong to the Codex CLI.

A probe on 3 October 2026 found that global `AGENTS.md` still appeared in `instructionSources` when `project_doc_max_bytes` was zero.  SpannBridge therefore rejects any thread that reports local instruction sources, before it sends a turn.  The error names the files and tells the user to move or rename them.  An empty global `AGENTS.md` was not reported in a second probe on the same day, so it does not block requests.  A configured MCP fixture started under default settings and stayed stopped under the thread override.

A native Windows probe with Codex CLI 0.160.0 and the read-only permission profile tried to write a diagnostic file and failed with `EPERM`.  This verifies that tested write operation, not every possible command or tool.

The model also confirmed that it could see an environment-context block containing the current directory.  SpannBridge asks the model to ignore environment details and to use bare file names.  That instruction does not remove the directory from provider input.

See [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) and [approvals and sandboxing](https://learn.chatgpt.com/docs/agent-approvals-security).  Managed policies, global hooks, and the behavior of future versions of the Codex CLI may need a separate review.

## 4. Model routing and effort

`default` is the recommended Model id for the Chatbot.  It selects the App Server default unless the launcher sets `--model`.  `ADAPTER_DEFAULT_MODEL` changes the public alias name.

Family aliases select the highest numeric unsuffixed version advertised at startup.  Hidden, preview, and dated variants do not become family targets.  Exact catalog IDs remain available.

Follow model-list pagination and reject a repeated cursor.  A picker ID can differ from the wire model ID.  Accept either public ID, but send the wire ID upstream.

A catalog is not an entitlement check.  Only a completed inference request verifies access for that request.  Restart to refresh alias targets.

An effort suffix such as `sol:medium` selects effort per request.  Reject unsupported explicit effort.  A suffix and a JSON `reasoning_effort` value must agree.

## 5. Streaming and partial failures

Forward final-answer deltas, not commentary or reasoning text.  Completed messages are a fallback when an older server supplies no deltas.  Avoid repeating text when a completed item follows its earlier deltas.

Streaming headers wait for answer text or five seconds.  A fast failure without partial text retains an HTTP error status.  A later failure becomes visible `[adapter error]` reply text.

Preserve useful partial text for streaming and non-streaming clients.  Do not add blank lines before an error when there is no partial answer.  Never retry a completion automatically.

When a client requests SSE usage, send a final usage chunk with empty choices.  Otherwise keep the compatible behavior of SpannBridge, which puts usage on the final chunk.  Always terminate successful or visibly failed streams with `[DONE]`.

## 6. Windows startup and cleanup

Run the `.mjs` launcher with Node.js.  Do not rely on file associations or double-clicking.  The documented commands do not require a PowerShell execution-policy change.

Discover native executables and npm's JavaScript entry point.  Do not spawn a Windows `.cmd` or `.ps1` shim directly from Node.js.  Direct `node adapter.mjs` startup uses the same discovery helper unless explicit CLI arguments are supplied.

Resolve entry-point paths through the filesystem before comparing them.  This allows execution from a junction or symlink.

The launcher asks `adapter.mjs` to shut down over IPC and allows three seconds for cleanup.  It then ends the process tree if necessary.  `adapter.mjs` interrupts active work, removes temporary images, and closes its child process.

The launcher checks the port before it starts SpannBridge.  SpannBridge then reserves the HTTP port before it creates or cleans its runtime folder.  During startup, the HTTP server returns 503 until the model catalog is ready.  A same-port startup failure must not clean an active instance's files.

Each port owns `runtime/<port>/`, such as `runtime/8765/`.  Startup deletes leftover files only in that subfolder, except `.gitignore`.  Another port's active files are left alone.  A hard termination can still leave files until the next startup on that port.  Root-level files left by older releases are not automatically deleted.

The regression test starts two copies of SpannBridge on different free ports.  The first copy holds an image request open while the second copy starts, handles an image, and stops.  The test also tries to start a third copy on a port that is already in use.  The first image file remains until its own request is cancelled.  The offline suites used free ports and could run while another port served the Chatbot.

SpannBridge requires Node.js 18 or newer.  Connection cleanup checks whether `closeAllConnections` exists and also closes tracked sockets.  Use a currently supported LTS release for deployment.

## 7. Logging and release practice

The offline test suite and the release builder are not part of this release.  The offline suite used a stub App Server, which simulated protocol events without sending model requests.  It covered concurrent partial failures, ID collisions, malformed JSON, discovery, authentication, timeouts, cancellation, images, graceful shutdown, and junctions.

Package an explicit list of files, not a whole working folder.  Leave out publisher metadata, private work logs, backups, runtime inputs, and model exports.  Before you publish, check every file for email addresses other than the contact address, personal paths, forbidden wording, and possessive trademark forms.  Check each packaged file against its source.  Do not upload a working folder through GitHub's web interface, which does not apply `.gitignore` rules.

The SpannBridge window shows routing metadata, error types, and the error messages that SpannBridge writes itself, not request messages.  SpannBridge withholds error text from the App Server and the raw stderr output of the Codex CLI.  Each refused request (HTTP 401, 403, or 404) logs one line, so that a wrong API key or Base URL is visible in the window.  The Codex CLI keeps its own logs and state, which SpannBridge does not control.

Offline tests do not prove a Chatbot round trip.  Validate the Programming subject, Java Shell, error correction, node attachments, and Graphics snapshots in the actual application before making those claims.

## 8. Other providers

Grok Build has a headless mode that resembles pattern A.  Muse Code has a session-server mode that resembles pattern B.  Neither adaptation has been tested here.  It is unconfirmed whether these programs bill the subscription when another program calls them.

Read section 8 of the Claude Code edition's [DEEP-DIVE.md](https://github.com/SpannAI/spannbridge-cli/blob/main/DEEP-DIVE.md) for the adaptation checklist.  Check current provider terms, authentication, billing, tool controls, and event formats before writing an adapter.

**Google Gemini.**  Do not adapt SpannBridge to a Google AI subscription because Google's current terms prohibit this structure.

- On 18 June 2026, Gemini CLI stopped accepting sign-in with a Google AI Pro or Ultra subscription ([Google's notice](https://developers.google.com/gemini-code-assist/docs/deprecations/code-assist-individuals)).  Those subscriptions now work with Google's Antigravity products.
- The [Antigravity terms](https://antigravity.google/terms) state that using third-party software, tools, or services to access the service is a breach of the agreement.  An adapted SpannBridge would be such third-party software.
- In February 2026, Google suspended the accounts of subscribers who used such tools ([Google's post](https://github.com/google-gemini/gemini-cli/discussions/20632)).

The paid APIs remain a separate route.  The Chatbot can use OpenAI-compatible API addresses directly without SpannBridge.  Check provider billing and supported model features.

These notes describe public pages read on 3 October 2026.  They are not legal advice.
