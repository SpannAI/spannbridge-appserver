# Windows deployment

This file describes the Windows setup of **SpannBridge** in detail, and how to solve setup problems.  SpannBridge connects the Chatbot window in COMSOL Multiphysics® software to OpenAI Codex, using your ChatGPT plan instead of an API key.  Spann Engineering Consulting LLC publishes it under the MIT License.  Start with [README.md](README.md), which has the connection diagram, the limitations, and a [checklist for future readers](README.md#if-you-are-reading-this-in-the-future).

This file belongs to the repository `SpannAI/spannbridge-appserver`, the ChatGPT edition of SpannBridge.  The separate repository `SpannAI/spannbridge-cli` holds the Claude Code edition, which runs Claude Code instead.  The two editions have different setup steps, so do not mix their instructions.

This GitHub repository and SpannBridge are neither developed by nor endorsed by COMSOL AB, nor by OpenAI.  COMSOL and COMSOL Multiphysics are registered trademarks of COMSOL AB.  OpenAI, ChatGPT, and Codex are trademarks of OpenAI.

Extract SpannBridge into any folder where you can write files.  In File Explorer, open that folder, type `powershell` in the address bar, and press Enter.  Run all commands below in the folder that contains `adapter.mjs`.  SpannBridge needs no particular drive or user name.  Copy commands from the code blocks, not from Markdown link markup.

Get the source only from [spann.ai](https://spann.ai/) or from GitHub under [SpannAI](https://github.com/SpannAI).  SpannBridge is not published on a package registry.  See the [warning about sources and sign-in](README.md#spannbridge) at the top of README.md.  Review the downloaded source before you run it.  Every command for users runs Node.js or another program directly.  The commands work under the Windows default PowerShell execution policy, *Restricted*, so you do not need to change or bypass it.  Your organization's separate rules about installing and running software still apply.

## 1. Node.js and the Codex CLI

Use a long-term support (LTS) release of Node.js.  SpannBridge requires Node.js 18 or newer.  The Codex CLI, which you install separately, may require a newer version.

```powershell
node --version
```

If Node.js is not installed, install it with this command and reopen PowerShell:

```powershell
winget install --id OpenJS.NodeJS.LTS -e
```

The Codex app from the Microsoft Store does not prove that a standalone Codex CLI is installed or that it is on the terminal's PATH.  The sign-in in the app and the search for the Codex CLI are separate checks.  SpannBridge includes the launcher `Start-SpannBridge.mjs`, so that the sign-in and SpannBridge find the Codex CLI in the same way.  Check which Codex CLI the launcher finds:

```powershell
node Start-SpannBridge.mjs codex --version
```

The launcher first uses `CODEX_BIN`, if you set it.  Otherwise it looks for the Codex CLI on the PATH, in the default npm folder for your user, and in the version folders that the Codex app keeps in your local application-data folder.  The launcher contains no user name and no app version hash.  The search in the Codex app's folders is best effort.  OpenAI does not guarantee the app's internal layout, and updates of the app may change it.  A file that the launcher finds must still pass the launcher's App Server check.

If the launcher finds no usable Codex CLI, install OpenAI's official npm package.  This command installs the Codex CLI, not SpannBridge:

```powershell
npm.cmd install -g @openai/codex
```

Then reopen PowerShell in the SpannBridge folder and repeat the version check.  The command uses `npm.cmd` because the PowerShell script policy can block `npm.ps1`.  SpannBridge starts npm's JavaScript entry point through Node.js with a list of arguments.  As a result, Windows paths with spaces work, and no command shell starts.

SpannBridge never installs software by itself and never changes the permanent PATH.  If npm uses a folder other than its default (a nondefault npm prefix), the Codex CLI must be on the PATH, or you must select it yourself:

```powershell
$npmPrefix = npm.cmd prefix -g
$env:CODEX_BIN = Join-Path $npmPrefix 'codex.cmd'
node Start-SpannBridge.mjs codex --version
```

This setting applies to the current terminal and to the programs that it starts.  Start SpannBridge from that terminal when you use the setting.  For a native Codex CLI that you installed separately, set `CODEX_BIN` to the actual path of its `codex.exe` instead.

## 2. Sign in with the Codex CLI

You may already be signed in.  Check with this command:

```powershell
node Start-SpannBridge.mjs codex login status
```

If you are not signed in, or if the Codex CLI is signed in with an API key, run this command:

```powershell
node Start-SpannBridge.mjs codex login
```

Choose **Sign in with ChatGPT**, so that your use counts against your ChatGPT plan.  Do not enter an API key for SpannBridge.  SpannBridge checks the sign-in mode through the App Server.

If the sign-in in the browser fails, turn on device-code sign-in in the security settings of your account, or ask the administrator of your workspace to turn it on.  Then run these commands:

```powershell
node Start-SpannBridge.mjs codex login --device-auth
node Start-SpannBridge.mjs codex login status
```

Use the same Windows account for the sign-in, for SpannBridge, and for COMSOL Multiphysics®.  If you changed `CODEX_HOME`, use the same value for the sign-in and for SpannBridge.  A sign-in in the Microsoft Store app does not replace the check of the Codex CLI that the launcher selects.  Do not copy credential files into the SpannBridge folder.  Windows Developer Mode is not needed.

## 3. Check, then start SpannBridge

The check tests Node.js, the version of the Codex CLI, its App Server command, the ChatGPT sign-in, and the port.  It starts neither SpannBridge nor the App Server, and it sends no request to a model:

```powershell
node Start-SpannBridge.mjs --check-only
```

The check requires a ChatGPT sign-in.  At full startup, SpannBridge also checks the account through the App Server and reads the model list.  Start SpannBridge from this terminal:

```powershell
node Start-SpannBridge.mjs
```

Both editions use port 8765 by default, so only one of them can run on that port at a time.  To run both, start one with `--port 8766` and change the Chatbot's Base URL to match.

Leave the window open.  Press Ctrl+C to stop SpannBridge.  No separate interactive session of the Codex CLI needs to stay open.

You can add options when you start SpannBridge, for example:

```powershell
node Start-SpannBridge.mjs --model terra --effort medium --timeout-seconds 600
```

`--model` sets what `default` means.  The Chatbot can still request another available model with each request.  The timeout is 240 seconds by default, with a maximum of 3600.  It limits how long a started request may run.  The calls that SpannBridge makes at startup have their own timeouts.  If the model does not support the default effort, SpannBridge uses the model's own default.  SpannBridge checks an effort suffix, such as `sol:medium` in the Chatbot's Model id, and returns an error if the model does not support it.  Programs that call SpannBridge directly can also send the JSON field `reasoning_effort`.  If both are present, their values must match.

The family names (`astra`, `sol`, `luna`, and `terra`) select the highest-numbered version of that family in the model list at startup.  For example, `sol` selects `gpt-6.1-sol` when that is the newest Sol model available.  Restart SpannBridge to find new versions, because a running SpannBridge keeps the mapping that it made at startup.  To see the actual model, check the startup output, or run `node Test-SpannBridge.mjs --check-only --model sol`.  The family names are SpannBridge's own shortcuts.  They do not mean that OpenAI accepts bare family names directly.  The model list does not show whether a request will succeed.  README.md describes the naming rules and how SpannBridge chooses among variants of a model.

To keep one particular version, enter its exact ID in the Chatbot's Model id.  Or start SpannBridge with `--model gpt-6.1-sol` and use `default` in the Chatbot.  Either way, SpannBridge does not switch versions by itself, but it cannot guarantee that OpenAI keeps that ID available.

Other options are `--port 8766`, `--token` for an optional local API key, and `--codex-path` for a specific Codex CLI program or npm shim (the small `codex.cmd` file that npm creates).  If you choose a Codex CLI with `--codex-path`, use the same option before `codex login` and before `codex login status`.  Do not store keys in source files or in command shortcuts.  If you start SpannBridge with `--token`, enter the same word as the API key in the Chatbot, and add `--token` to the test commands.

## 4. Check the running SpannBridge

Open a second PowerShell window in the same folder, and run this command:

```powershell
node Test-SpannBridge.mjs --check-only
```

This command checks `/status` and the model list without sending a request to a model.  To check one family name, add `--model terra`.  To test a real streamed request and its token counts, leave out `--check-only`.  That request counts against your plan, including the [input that the Codex CLI adds](README.md#usage-and-codex-cli-overhead).

## 5. Configure the Chatbot

Open **File → Preferences → Chatbot** and enter these settings:

| Setting | Value |
|---|---|
| Enable Chatbot | Selected |
| Provider | OpenAI API compatible |
| Base URL | `http://127.0.0.1:8765/v1` |
| Model id | `default`, or a model that the check lists |
| Context length | `128000` |
| Tool calling | Cleared |
| API key | Leave it blank.  If you started SpannBridge with `--token`, enter that word. |

The context length of 128,000 is the COMSOL® default.  It is a cautious setting, not a statement about the largest context of each model.  The Base URL also works without `/v1`, because SpannBridge accepts any path that ends in `chat/completions`.  If you changed the port, change it in the Chatbot's Base URL and in the `--port` option of the test script.

On the **Home** toolbar, choose **Windows → Chatbot**.  Set the subject to **Programming**, so that the Chatbot sends its own Java-programming instructions.  You can send the generated Java code to the Java Shell.  Send any Java error back in the conversation for a fix.  README.md describes the family names and the limitations.

## Troubleshooting

### Installer reports missing OSArchitecture

This error comes from the part of the standalone PowerShell installer of the Codex CLI that looks up the processor architecture.  It occurs before SpannBridge starts.  It does not prove that every PowerShell 5.1 installation is incompatible.  A fresh PowerShell session started with `-NoProfile` may help when a profile or loaded assemblies cause the problem, but this is not a guaranteed fix.

The npm installation in step 1 does not use that installer code.  Do not patch the downloaded script, guess an architecture, or turn off its strict-mode checks.  If you use another installation method from OpenAI's documentation, copy the plain address or command, not the Markdown link syntax.

### codex is not recognized

Use the included launcher, `Start-SpannBridge.mjs`.  The Microsoft Store app can work even when no `codex` command is available in a normal terminal.  If the launcher finds nothing, install the Codex CLI with npm, reopen PowerShell, and check again with the launcher.  For a nondefault npm prefix, use the `CODEX_BIN` setting from step 1.  Do not copy the path of a versioned app folder into a permanent PATH setting.

### PowerShell refuses a local script

Use the documented commands `node Start-SpannBridge.mjs` and `node Test-SpannBridge.mjs`.  This release contains no PowerShell scripts.  Do not change the execution policy for SpannBridge.  Start SpannBridge with the command, not by double-clicking an `.mjs` file.

### Sign-in works in the app but fails in SpannBridge

Run `node Start-SpannBridge.mjs codex login status` under the Windows account that runs SpannBridge.  Check any `CODEX_BIN` and `CODEX_HOME` settings.  Try device-code sign-in when the sign-in in the browser fails.  Never paste sign-in logs or credentials into a public issue.  Review them and remove account details first.

### Codex loaded local instruction files

The Codex CLI reads instruction files, such as `AGENTS.md`, from its home folder.  That folder is normally `.codex` in your user folder, or the folder that `CODEX_HOME` names.  SpannBridge does not send your question when Codex reports such a file, because the file would change the Chatbot's instructions.  The error message names the file.  Move or rename it, then send the message again.

### Cannot find home directory

Run the sign-in and SpannBridge from a normal PowerShell session of your user account.  This error can occur inside the restricted environments of AI agents.  Moving SpannBridge to another folder does not necessarily solve it.  Do not copy the credentials of another session by hand.

### Missing App Server command or a changed app layout

Update the Codex CLI with the method that you used to install it.  For npm, repeat `npm.cmd install -g @openai/codex`.  Update software from the Microsoft Store through the Store or the app's own updater.  Do not run a standalone updater on a program that the Store manages.  If SpannBridge stops finding the copy inside the app, install a standalone Codex CLI and select it explicitly.  Run the check again after any update.

### Port conflict, status error, or timeout

Stop the SpannBridge that is already running, or use `--port 8766`.  HTTP 503 on `/status` means that the App Server stopped.  Restart SpannBridge and read its window.  For answers that you expect to take longer, use `--timeout-seconds 600`.  SpannBridge does not retry requests automatically.  The keep-alive signals show that the connection is still open.  The answer appears when the App Server sends it.  Older versions of the App Server may send only complete messages.

### A reply ends with an adapter error

A reply that ends with `[adapter error]` means that the request failed after SpannBridge started the reply.  SpannBridge keeps any partial answer, for streamed and for non-streamed requests.  Read the error in the SpannBridge window before you decide whether to resend.  SpannBridge does not retry requests automatically.

For streamed requests, SpannBridge waits up to five seconds for answer text before it sends the HTTP headers.  A fast failure without partial text therefore returns an HTTP error instead of an empty reply.  A later failure appears as visible reply text.

## License and references

The MIT License covers SpannBridge, not the tools that you install separately or access to a provider's service.  Check the README's checklist for policy and compatibility again before you deploy, especially when you return to an old release.

OpenAI's documentation covers [installing the Codex CLI](https://learn.chatgpt.com/docs/codex/cli), [its releases](https://learn.chatgpt.com/docs/changelog), [authentication](https://learn.chatgpt.com/docs/auth), and the [App Server](https://learn.chatgpt.com/docs/app-server).
