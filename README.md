# SpannBridge

Connects the Chatbot window in COMSOL Multiphysics® software to OpenAI Codex, using your ChatGPT plan instead of an API key.

An open-source tech demo published by Spann Engineering Consulting LLC, whose website is [spann.ai](https://spann.ai).  Spann Engineering Consulting LLC helps clients solve their toughest R&D challenges and continue to get value from delivered simulations through AI automation.

Release 1.0 · October 2026 · MIT License · Windows · COMSOL Multiphysics® 6.4

**This GitHub repository is neither developed by nor endorsed by COMSOL AB**, nor by OpenAI.  See [Publisher, trademarks, and affiliation](#publisher-trademarks-and-affiliation).

SpannBridge comes as two separate editions.  **This one runs OpenAI Codex on a ChatGPT plan.**  For Claude Code on a Claude subscription, see [SpannAI/spannbridge-cli](https://github.com/SpannAI/spannbridge-cli).

**This repository is for Windows only, because the Chatbot window in COMSOL Multiphysics® 6.4 runs only on Windows.**

> **Follow your organization's rules before you send work data.**  Everything you type or attach in the Chatbot leaves your PC and goes to OpenAI, a third-party AI company.  This includes questions, model code, Model Builder nodes, Graphics snapshots, and results.  Many organizations restrict or forbid sending confidential, client, proprietary, or export-controlled information to outside AI services.  Check your organization's policy first.  SpannBridge does not filter, redact, or block anything.  Spann Engineering Consulting LLC also recommends that you turn off model training in your ChatGPT privacy settings.  See [Your data and your organization's rules](#your-data-and-your-organizations-rules).

> SpannBridge is a **single-user tool for your own PC and your own ChatGPT account**.  OpenAI decides whether it permits this use and how it counts usage against your plan.  Those rules can change.  Read [Is this allowed?  Check before you run it](#is-this-allowed-check-before-you-run-it) as well, especially if you are reading this long after October 2026.

> **Your work is yours.**  You may use SpannBridge free of charge, including for paid engineering work.  Spann Engineering Consulting LLC claims no ownership of anything you create with it and accepts no liability for it.  Using SpannBridge requires no credit or acknowledgment.  See [What the MIT License means for you](#what-the-mit-license-means-for-you).

> **Get SpannBridge only from its official sources.**  Spann Engineering Consulting LLC publishes SpannBridge and its other products only on [spann.ai](https://spann.ai) and on GitHub under [SpannAI](https://github.com/SpannAI).  SpannBridge has no separate domain name.  Its announcement page is [spann.ai/spannbridge](https://spann.ai/spannbridge), and its contact address is [spannbridge@spann.ai](mailto:spannbridge@spann.ai).  Spann Engineering Consulting LLC does not operate any other site that claims to be the SpannBridge website, so do not download anything from such a site.  SpannBridge is not published on PyPI, npm, or any other package registry.  The MIT License allows others to publish copies and modified versions, but Spann Engineering Consulting LLC has not reviewed them.
>
> **SpannBridge is free.**  It never asks for payment, passwords, or personal information.  The only sign-in is `codex login`, which opens OpenAI's sign-in page.  You run it through the launcher, as `node Start-SpannBridge.mjs codex login`.  Enter your account credentials only on that official page.  Your ChatGPT plan is a separate purchase from OpenAI.  See OpenAI's [sign-in documentation](https://learn.chatgpt.com/docs/developer-commands#codex-login).
>
> **You can read every line before you run it.**  SpannBridge is distributed as JavaScript scripts and other plain-text files.  It is never distributed as a compiled program such as an `.exe` file.  You, or an AI assistant you trust, can read the code to check that it does what this README says.
>
> Node.js and the Codex CLI are separate programs that you install before you use SpannBridge.  They may include compiled programs.  The npm command in step 3 installs OpenAI's official `@openai/codex` package, not SpannBridge.

Is there a feature you'd like to add?  Developers and AI coding assistants who want to change SpannBridge should start with [DEEP-DIVE.md](DEEP-DIVE.md).  The [DEEP-DIVE.md](https://github.com/SpannAI/spannbridge-cli/blob/main/DEEP-DIVE.md) of the Claude Code edition describes integration problems that apply to both editions.  If you want to adapt SpannBridge to another AI provider, I've left some notes at [Other AI providers](#other-ai-providers).

## Contents

- [What it does](#what-it-does)
- [How it works](#how-it-works)
- [Your data and your organization's rules](#your-data-and-your-organizations-rules)
- [Is this allowed?  Check before you run it](#is-this-allowed-check-before-you-run-it)
- [Requirements](#requirements)
- [What's in this repository](#whats-in-this-repository)
- [Quick start (Windows)](#quick-start-windows)
- [Using it](#using-it)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Limitations](#limitations)
- [If you are reading this in the future](#if-you-are-reading-this-in-the-future)
- [Reporting a problem and contact](#reporting-a-problem-and-contact)
- [Using the OpenAI API directly instead](#using-the-openai-api-directly-instead)
- [Other AI providers](#other-ai-providers)
- [What the MIT License means for you](#what-the-mit-license-means-for-you)
- [Publisher, trademarks, and affiliation](#publisher-trademarks-and-affiliation)

## What it does

COMSOL Multiphysics® 6.4 simulation software has a built-in Chatbot window.  The Chatbot can connect to any AI service that accepts requests in the format of OpenAI's chat API (an "OpenAI-compatible" service).  SpannBridge is a small program that runs on your PC and acts as that service.  It passes each question to OpenAI's **Codex** through the **Codex CLI**, OpenAI's official command-line program, which is signed in with your own ChatGPT account.

- **Chat with Codex inside COMSOL Multiphysics®.**  Ask modeling questions and discuss errors without copying them into a separate chat window.  Replies appear in the Chatbot window as Codex writes them.  The Chatbot's token counters also update.
- **Write COMSOL® API for Java code that runs.**  SpannBridge tells Codex the rules of the **Java Shell**, the window in COMSOL Multiphysics® that runs Java statements.  The rules are: plain statements on the open `model`, no class or `main` method, checked exceptions caught inline, and a plot after solving.  As a result, **Send to Java Shell → Run** builds the model in your Model Builder.  If the Java Shell reports an error, select it, click **Send to Chatbot**, ask for a fix, and run the code again.
- **Understand your model.**  Right-click a Model Builder node and choose **Send to Chatbot → Node**.  The node arrives as its Java code, and Codex can explain or fix it.
- **See your results.**  Graphics-window snapshots and PNG, JPEG, or GIF files that you send to the Chatbot reach Codex as images.
- **Choose the model and how long it thinks** for each conversation, in the Chatbot's *Model id* setting.  Examples are `sol`, `terra`, and `sol:medium`.
- **Protect the Chatbot's instructions.**  The Codex CLI can read instruction files that you keep on your PC, for example `AGENTS.md` in the Codex home folder.  Codex would add the content of such a file to the model's instructions.  If Codex reports such a file, SpannBridge refuses the request and tells you which file to move or rename.

SpannBridge never operates COMSOL Multiphysics® by itself.  Nothing in your model changes until you click **Send to Java Shell** and **Run**.  SpannBridge does **not** support the Chatbot's *Tool calling* option, which is its built-in documentation search.  SpannBridge is also not a server for other people.  See [Limitations](#limitations).

## How it works

```
 COMSOL Multiphysics® 6.4 (Chatbot window)
        │  OpenAI-compatible HTTP:  POST /v1/chat/completions
        ▼
 SpannBridge (adapter.mjs, listening on 127.0.0.1:8765, this PC only)
        │  JSON-RPC over stdin and stdout to one long-running process
        ▼
 App Server (codex app-server, a mode of the official Codex CLI)
        │  signed in with your ChatGPT account through the Codex CLI's own sign-in
        │  The Codex CLI stores and renews the sign-in.  SpannBridge never touches it.
        ▼
 OpenAI (use counts against your ChatGPT plan's Codex usage limits)
```

The **App Server** is a long-running mode of the Codex CLI that other programs can control.  These steps happen for each message you send in the Chatbot window:

1. **The Chatbot window sends the whole conversation so far** to SpannBridge, in OpenAI's chat format.  The conversation includes the Chatbot's system prompt (its standing instructions to the AI), your messages, Codex's earlier replies, and any attachments.
2. **SpannBridge checks the request and finds the model that the Model id names.**  If SpannBridge cannot serve a request, it returns a clear error and does not guess.  Examples are a request with tools, an unknown model, and an unsupported attachment.
3. **SpannBridge starts a new, temporary Codex conversation.**  It tells Codex to act as a chat assistant for COMSOL Multiphysics®, and it includes the Java Shell rules.  Codex works in a read-only sandbox with network access turned off.  SpannBridge declines every request from Codex for permission to act.  Your whole conversation goes in as one message, and images go in as temporary files.
4. **SpannBridge streams the answer.**  It forwards the pieces of Codex's final answer as they arrive, and it keeps the connection open while Codex works.  It does not forward Codex's commentary (its progress notes) or its reasoning text.  The last piece includes the token counts when Codex reports them.
5. **SpannBridge cleans up.**  It deletes the temporary images and ends the temporary conversation.

SpannBridge **never** does any of these things:

- read, copy, store, or forward your ChatGPT credentials
- call OpenAI's servers itself, or scrape the ChatGPT website
- accept connections from other computers or from web pages
- log the content of your messages
- send anything to Spann Engineering Consulting LLC

For each request, SpannBridge logs the model and the number of messages.

## Your data and your organization's rules

**Check that your organization allows it before you use SpannBridge for work.**  Everything in a Chatbot conversation goes to OpenAI, a third-party AI company.  That includes your questions, the Chatbot's own prompt, Model Builder nodes (as Java code), Graphics snapshots, attached files, and Codex's earlier replies in the conversation.

- **Your organization's rules come first.**  Many employers and clients restrict or forbid sending confidential, proprietary, client-owned, personal, or export-controlled information to outside AI services.  Export-controlled information includes, for example, technical data under the US ITAR and EAR export-control regulations.  Some organizations allow only approved tools and accounts.  SpannBridge does not change those rules.  You are responsible for following them.
- **A personal ChatGPT account is not automatically an approved tool for work data.**  If your organization has an approved way to use ChatGPT, use that way and follow its rules.
- **SpannBridge sends exactly what the Chatbot sends.**  It does not filter, redact, or block anything.  If something must not leave your PC, do not type it, attach it, or send it to the Chatbot.
- **Nothing goes to Spann Engineering Consulting LLC.**  SpannBridge has neither telemetry, usage statistics, nor an update check.  SpannBridge makes no network connections except on 127.0.0.1 (your own PC).  Your data goes only from the official Codex CLI to OpenAI.  Spann Engineering Consulting LLC receives information from you only if you contact it yourself, for example by email.
- **Your ChatGPT account's terms and privacy settings govern how OpenAI handles the data,** as with any other use of your ChatGPT account.  SpannBridge does not send your other ChatGPT chats.
- **Turn off model training.**  Spann Engineering Consulting LLC recommends this to everyone who uses SpannBridge.  To turn it off, open ChatGPT's account menu, choose **Settings → Data controls**, and switch off **Improve the model for everyone**.  These steps were checked on 3 October 2026.  OpenAI states that this setting covers new Codex tasks on a personal ChatGPT plan.  Also switch off **Include environments** in [Codex settings](https://chatgpt.com/codex/settings), because the ChatGPT setting does not change that separate setting for sharing environments.  See OpenAI's [data controls page](https://help.openai.com/en/articles/7730893-data-controls-in-chatgpt).

The Codex CLI also tells the model some facts about the PC it runs on, including its working folder.  That folder path can contain your Windows user name.  SpannBridge tells Codex to ignore these facts.  The Codex CLI also reads its own settings files.  If it reports that it loaded one of your instruction files, SpannBridge refuses the request before it sends your question.

On your PC, SpannBridge writes attached images to temporary files and deletes them after the request.  SpannBridge logs the model and the number of messages, never message content.

Turning off training does not set how long OpenAI keeps your data.  OpenAI's [retention page](https://help.openai.com/en/articles/8983778-chat-and-file-retention-in-chatgpt) says that regular ChatGPT chats remain until you delete them, and that copies of Temporary Chats may remain for up to 30 days.  OpenAI's pages do not state a shorter retention period for Codex tasks when training is off.  The temporary conversations that SpannBridge starts are not ChatGPT's Temporary Chat feature.  So do not assume that OpenAI keeps nothing, even though SpannBridge uses temporary conversations and deletes its local image files.  These sources were checked on 3 October 2026.

If you send feedback to OpenAI, the conversation that the feedback belongs to may become eligible for training, even after you turn training off.  See OpenAI's [model-improvement explanation](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance).

## Is this allowed? Check before you run it

**Short answer as of 3 October 2026.**  Codex supports signing in with a ChatGPT plan, and its use then counts against that plan's Codex usage limits.  OpenAI documents the [Codex App Server](https://learn.chatgpt.com/docs/app-server) for building Codex into another program.  For unattended automation, such as automated build and test pipelines, OpenAI's guidance names the Codex SDK instead.  SpannBridge uses the App Server for interactive chat, and it runs the official Codex CLI.  SpannBridge never handles your credentials.  It serves only you, on your own PC.  These documented mechanisms do not mean that OpenAI reviewed or endorsed SpannBridge.  Check the terms that apply to your account and your use.

**What not to do.**  These are the author's cautions.  Do not use SpannBridge for any of these:

- sharing your ChatGPT account, or routing other people's requests through it
- making SpannBridge reachable from a network
- heavy automated workloads

Plan usage limits assume ordinary use.  The limits, and any options to buy extra credits, depend on your plan.

This section is the author's reading of OpenAI's public documents.  It is not legal advice and not an OpenAI endorsement.  A successful sign-in or reply does not prove that a use is permitted.  You are responsible for your own compliance.

### How to check the current rules

Check these pages before you rely on SpannBridge.  Check them again whenever you update the Codex CLI or return to SpannBridge after a while.

| Question | Where to look | What to look for |
|---|---|---|
| Is ChatGPT sign-in still meant for this kind of use? | [Terms of Use](https://openai.com/policies/terms-of-use/), [Service Terms](https://openai.com/policies/service-terms/), [Usage Policies](https://openai.com/policies/usage-policies/), and the [Services Agreement](https://openai.com/policies/services-agreement/) if your workspace is under it | Look for provisions on account sharing, automated or programmatic access, usage limits, and third-party integrations.  Regional terms or a negotiated agreement may differ. |
| How is Codex use counted on your plan? | [Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan) | Check which plans include Codex, how the limits and their resets work, and what happens when you reach a limit. |
| Is the App Server still the supported way to build Codex into a program? | [Codex App Server](https://learn.chatgpt.com/docs/app-server) and [Codex authentication](https://learn.chatgpt.com/docs/auth) | Confirm that the App Server is still documented and still works with ChatGPT sign-in. |
| Has anything changed? | [Codex changelog](https://learn.chatgpt.com/docs/changelog) | Look for changes to the App Server, the sign-in, or the Codex CLI. |

If any of these pages says that this use is not allowed, or counts it in a way that you do not want, **stop using SpannBridge**.  Use [the OpenAI API directly](#using-the-openai-api-directly-instead) instead.  If your account is in a **business workspace**, your organization's agreement and admin settings apply.  Ask your admin first in that case.  If the terms leave this unclear, ask OpenAI.

## Requirements

- **Windows 10 or 11.**  The Chatbot window in COMSOL Multiphysics® 6.4 is Windows-only.  For Mac and Linux, see [Mac and Linux](#mac-and-linux).
- **COMSOL Multiphysics® 6.4 simulation software** with the Chatbot window.  Version 6.4 installs the Chatbot by default.
- **A ChatGPT plan that includes Codex**, with Codex usage left in the current limit period.
- **Node.js 18 or newer.**  Use a long-term support (LTS) release that is still supported.
- **The Codex CLI**, OpenAI's command-line program.  Step 3 below installs it.  The Codex app from the Microsoft Store may also work, because SpannBridge can find the copy of the Codex CLI inside the app.  That is not guaranteed.
- No administrator rights, no API key, and no Python.

**Tested with** (October 2026): Windows, COMSOL Multiphysics® 6.4, Node.js 22.7.0, the native Codex CLI 0.160.0, and a ChatGPT plan.  The Model id `astra` was tested in the Chatbot window.

## What's in this repository

Three files are needed to run SpannBridge.  Everything else is optional or documentation.  The repository does not include COMSOL Multiphysics® software or any model files.

| File | What it is | Needed to run SpannBridge? |
|---|---|---|
| `adapter.mjs` | SpannBridge itself: the local server that the Chatbot connects to. | **Yes** |
| `Start-SpannBridge.mjs` | The launcher.  It checks the prerequisites, passes sign-in commands to the Codex CLI, and starts `adapter.mjs`. | **Yes** |
| `cli.mjs` | Shared code that finds the Codex CLI and manages its processes. | **Yes** |
| `Test-SpannBridge.mjs` | Checks a running SpannBridge, with or without a real request. | No |
| `runtime/.gitignore` | Keeps temporary images out of git.  SpannBridge creates the `runtime` folder automatically. | No |
| `.gitignore` | Tells git which local and generated files to skip. | No |
| `README.md` | This guide. | No, documentation only |
| `DEPLOYMENT.md` | Detailed Windows setup and troubleshooting. | No, documentation only |
| `DEEP-DIVE.md` | Notes for developers on integrating a long-running session server such as the App Server. | No, documentation only |
| `LICENSE` | The MIT License, the legal text.  See [What the MIT License means for you](#what-the-mit-license-means-for-you). | No, but keep it with the code if you share the code |

## Quick start (Windows)

**After the first time, running SpannBridge is one command.**  Once you've set up SpannBridge the first time, all you need to do is open a PowerShell window in the SpannBridge folder and type `node Start-SpannBridge.mjs`.  Leave that window open while you use the Chatbot.  The other steps below are one-time setup and checks.  COMSOL Multiphysics® keeps the same Chatbot settings.  If you start SpannBridge with custom options such as `--token`, use the same options each time.  If SpannBridge reports that ChatGPT sign-in is required, repeat step 4.

Use a normal **PowerShell** window, not an Administrator window.  Run all commands in the SpannBridge folder.  [DEPLOYMENT.md](DEPLOYMENT.md) describes every step in more detail.

### 1. Get SpannBridge

Get SpannBridge in one of two ways.  Put it in a folder where you can write files, because SpannBridge writes temporary images into its own `runtime` folder.  Spaces in the path are fine.

**Download the ZIP.**  On the repository's GitHub page, click **Code → Download ZIP**, and extract the ZIP.  Windows often extracts the ZIP into a folder inside a folder of the same name, so use the inner one if you see only one folder.

**Or clone the repository with git.**  Git is not part of Windows, so use this way only if you have git installed.  Open PowerShell in the folder where you want to put SpannBridge, and run these commands:

```powershell
git clone https://github.com/SpannAI/spannbridge-appserver.git
cd spannbridge-appserver
```

To get a newer version later, run `git pull` in the `spannbridge-appserver` folder.

Review the source before you run it.  Then open PowerShell in the folder that contains `Start-SpannBridge.mjs`, if it is not already open there.  To do that, open the folder in File Explorer, type `powershell` in the address bar, and press Enter.

SpannBridge has no PowerShell scripts.  Every command below runs Node.js or another program directly, so the PowerShell script setting (the execution policy) does not apply.  The commands work under the Windows default setting, *Restricted*.  You do not need to bypass or change it.  Follow any separate rules of your organization about installing or running software.

### 2. Check Node.js

Check which version of Node.js is installed:

```powershell
node --version
```

If Node.js is missing or older than version 18, install the current LTS release with this command.  Then reopen PowerShell in the folder.

```powershell
winget install --id OpenJS.NodeJS.LTS -e
```

### 3. Check the Codex CLI

The launcher finds the Codex CLI for sign-in and for startup.  Check that it finds one:

```powershell
node Start-SpannBridge.mjs codex --version
```

If the launcher finds no usable Codex CLI, install OpenAI's official package with this command.  Then reopen PowerShell and check again.

```powershell
npm.cmd install -g @openai/codex
```

OpenAI's current instructions are on its [Codex CLI](https://learn.chatgpt.com/docs/codex/cli) page.

### 4. Sign in with your ChatGPT account

You may already be signed in.  Check with this command:

```powershell
node Start-SpannBridge.mjs codex login status
```

If you are not signed in, run this command:

```powershell
node Start-SpannBridge.mjs codex login
```

Choose **Sign in with ChatGPT**, not API-key sign-in.  Use the same Windows account for the sign-in, for SpannBridge, and for COMSOL Multiphysics®.  If the sign-in in the browser fails, add `--device-auth` to the command.  You may first need to allow device sign-in in the security settings of your account or workspace.

### 5. Check, then start SpannBridge

First run a check that starts nothing and sends nothing:

```powershell
node Start-SpannBridge.mjs --check-only
```

The check ends with `PASS: ready to start` or tells you what to fix.  It checks Node.js, the Codex CLI, the App Server command, the ChatGPT sign-in, and whether the port is free.  It starts neither SpannBridge nor the App Server.  It sends no request to a model.

Then start SpannBridge:

```powershell
node Start-SpannBridge.mjs
```

SpannBridge starts the App Server in the background, so no separate Codex window needs to stay open.  **Leave the SpannBridge window open** while you use the Chatbot.  Press Ctrl+C to stop SpannBridge.  Start it with the command, not by double-clicking `Start-SpannBridge.mjs`.  Depending on your PC, Windows opens a double-clicked `.mjs` file in another program, or runs it in a window that closes before you can read an error.

A good start looks like this:

```
Using native CLI.
PASS: ready to start.  Node.js, CLI, app-server command, ChatGPT sign-in, and port checked.  No completion sent.
Base URL: http://127.0.0.1:8765/v1
Model id: default
Tool calling: off
Local API key: not required (leave the API key blank)
Leave this window open.  Press Ctrl+C to stop.
Codex authenticated (chatgpt); model=gpt-6.1-sol
SpannBridge listening on http://127.0.0.1:8765/v1
Model ids: default=gpt-6.1-sol, sol=gpt-6.1-sol, astra=gpt-6-astra, luna=gpt-6-luna, terra=gpt-5.6-terra
Local API key: not required (leave the API key blank)
```

At startup, SpannBridge reads the list of models that the App Server offers to your account (the model list).  The model names depend on the installed App Server, your account, and the date.  Only model families in the model list appear.  A listed model is not proof that your account can complete a request with it.

### 6. Test SpannBridge before you open COMSOL Multiphysics®

Open a second PowerShell window in the same folder.  First run a check that uses **none** of your plan:

```powershell
node Test-SpannBridge.mjs --check-only --model default
```

The check lists the available model IDs and the model that `default` selects.  If you want, then send one short real request.  It counts against your plan, including the [input that the Codex CLI adds](#usage-and-codex-cli-overhead):

```powershell
node Test-SpannBridge.mjs --model default
```

The output should end with `PASS`.  If you started SpannBridge with `--token`, add the same `--token YOUR-TOKEN` to both commands.

### 7. Point the Chatbot at SpannBridge

In COMSOL Multiphysics®, choose **File → Preferences → Chatbot**, tick **Enable Chatbot**, and enter these settings:

| Setting | Value |
|---|---|
| Provider | **OpenAI API compatible** |
| Base URL | `http://127.0.0.1:8765/v1` |
| Model id | `default`.  For other choices, see [Choosing a model and effort](#choosing-a-model-and-effort). |
| Context length (tokens) | `128000`, the COMSOL® default |
| Tool calling | **Cleared** (off).  If it is on, SpannBridge returns an error that asks you to clear it. |
| API key | Leave it blank.  If you started SpannBridge with `--token`, enter that word. |

Click **OK**.  Open the Chatbot from the **Home** toolbar with **Windows → Chatbot**.

These settings are the same for both SpannBridge editions, so you can switch between them without changing the Chatbot preferences.  The context length is the limit that the Chatbot applies to the input and output of each request.  On 3 October 2026, 128,000 tokens fit within the context window of every model in either edition, with room left for what each command-line program adds to the prompt.

Both SpannBridge editions use port 8765 by default, so only one of them can run at a time.  To run both, start one with `--port 8766`, and set the Chatbot's Base URL to `http://127.0.0.1:8766/v1` when you use that one.

### 8. Try a first conversation

1. Choose **File → New → Blank Model**, so the generated code has a clean model to build in.
2. In the Chatbot window, set the subject (top left) to **Programming**.  The Chatbot then sends its own Java-programming instructions.
3. Ask, for example:
   > Write COMSOL® API for Java code to create a 2D heat transfer model of a 10 cm square steel plate,
   > 20 °C on the left edge, 100 °C on the right, insulated top and bottom, and solve it.
4. On the reply, click **Send to Java Shell**, then **Run**.  The nodes appear in the Model Builder, and the study solves.
5. If the Java Shell shows an error, select the error, right-click, choose **Send to Chatbot**, ask "fix this", and repeat.  If no plot appears, ask "add a temperature surface plot and run it".

## Using it

### Choosing a model and effort

The Chatbot's **Model id** setting tells SpannBridge which model to request from Codex:

| Model id | Meaning |
|---|---|
| `default` | The model that the App Server reports as the default for your plan.  If you started SpannBridge with `--model`, it is the model that you chose there. |
| `astra`, `sol`, `luna`, or `terra` | The highest-numbered version of that family in the model list when SpannBridge started.  For example, `sol` selected `gpt-6.1-sol` on 3 October 2026. |
| An exact ID, for example `gpt-6.1-sol` | Exactly that model. |
| Anything else | SpannBridge refuses the request with an error that lists the IDs you can use. |

The family names are SpannBridge's own shortcuts, not OpenAI's.  They match only IDs of the form `gpt-<version>-<family>`.  SpannBridge skips preview, dated, and hidden models.  A family that is missing from the model list does not appear.  SpannBridge reads the model list once, at startup, so restart SpannBridge to update it.  Reading the model list sends no request to a model, and a listed model is not proof that your account can use it.

*Effort* (reasoning effort) is the Codex setting for how much the model thinks before it answers.  You set the default effort when you start SpannBridge, with `--effort`.  The default is `low`.  If a model does not offer that level, SpannBridge uses the model's own default and says so in its window.  The Chatbot has no effort setting, so SpannBridge reads an optional **suffix** on the Model id, such as `sol:medium`.  The suffix applies to that conversation only:

| Model id example | What it requests |
|---|---|
| `sol` | The model that `sol` selects, with the default effort.  SpannBridge adjusts the effort if the model does not support it. |
| `sol:medium` | The model that `sol` selects, with medium effort. |
| `gpt-6.1-sol:low` | Exactly that model, with low effort. |

An effort in a suffix must be one of the `--effort` values, and the selected model must support it.  SpannBridge returns an error for an unsupported suffix and does not change the effort silently.  Programs that call SpannBridge directly can send OpenAI's `reasoning_effort` field with each request.  If a request has both a suffix and that field, their values must match.

The reply appears in the Chatbot window as Codex writes it.  Older versions of the App Server may send only complete messages, which then appear all at once.  SpannBridge does not forward Codex's commentary or reasoning text.

If a request fails before any reply text arrives, SpannBridge returns an HTTP error.  If a request fails after part of the reply has arrived, SpannBridge keeps the partial reply and adds `[adapter error]` text after it.  While Codex is still thinking, SpannBridge sends a small keep-alive signal every 15 seconds so that the connection stays open.

### Attachments and images

- **Model Builder nodes** arrive as Java code inside your message.
- **Graphics snapshots and image files** in PNG, JPEG, or GIF format reach Codex as temporary image files.  SpannBridge deletes the files after the request.  Programs that call SpannBridge directly can also send WebP images inside the request.
- SpannBridge refuses images given as web links, and other attachment types, with an error.  It does not drop them silently.
- **The Chatbot resends the entire conversation with every message, including every earlier image.**  Start a new Chatbot conversation when you no longer need the old images.

On 3 October 2026, a comparison of six requests used a synthetic PNG image with a red left half and a blue right half.  Three replies from Sol named both colors correctly, and three replies from Luna did not.  A separate check confirmed that the temporary image file matched the original bytes.  This is a dated observation, not a guarantee about either model.

### Reading the SpannBridge window

```
POST /v1/chat/completions model=sol->gpt-6.1-sol effort=low stream=true messages=3
```

- `model=x->y` shows what the Chatbot asked for and the model that SpannBridge passed to Codex.
- SpannBridge logs **no message content**.  If the Codex CLI writes a diagnostic message, SpannBridge prints one `[upstream]` notice and withholds the details.  The Codex CLI keeps its own logs and state.
- When a request fails, the window shows the HTTP status, for example `refused, HTTP 401` for a wrong API key.  The line also includes the reason when SpannBridge wrote the error message itself.  SpannBridge does not print error text that comes from Codex, because that text could repeat parts of your messages.  SpannBridge sends that text to the Chatbot instead.

### Usage and Codex CLI overhead

On 3 October 2026, tiny test prompts used about 9,000 to 11,500 input tokens per request with the native Codex CLI 0.160.0 (measured).  The input count includes the Codex CLI's own instructions, the facts that it adds about your PC, and SpannBridge's prompt, not only your message.  Each request starts a new temporary conversation and resends the whole Chatbot conversation.

These requests count against your ChatGPT plan's Codex usage limits.  The reported token counts are not an API bill, and they do not convert directly into how much of your limit remains.  The model, the effort, caching, and OpenAI's rules all affect usage.  Do not assume that a short question uses only a few tokens.

### Check the engineering

Codex can be wrong, including when it sounds certain.  Check generated code and results before you rely on them, as you would check a colleague's first draft.  Check in particular the units, material data, boundary conditions, mesh, and solver settings.  SpannBridge does not certify answers or replace engineering judgment.

Before you send anything from a work project, read [Your data and your organization's rules](#your-data-and-your-organizations-rules).

## Configuration

**Launcher options.**  Add any of these after `node Start-SpannBridge.mjs`:

| Option | Default | Meaning |
|---|---|---|
| `--check-only` | off | Checks Node.js, the Codex CLI, the App Server command, the ChatGPT sign-in, and the port, then stops.  It starts nothing and sends nothing. |
| `--port` | `8765` | The port that SpannBridge listens on, always on 127.0.0.1 (this PC only).  If you change it, change the Base URL in the Chatbot preferences to match. |
| `--token` | *(none)* | The API key that the Chatbot must send.  Choose your own word.  It is not your ChatGPT password or an OpenAI API key.  If the token is blank, SpannBridge requires no key.  Spaces before and after the word are ignored. |
| `--model` | *(App Server default)* | The model that `default` selects.  It can be a family name or an exact model ID. |
| `--effort` | `low` | The default effort.  It can be `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`, or `ultra`, where the model supports it. |
| `--timeout-seconds` | `240` | Stops a request that takes longer.  The allowed range is 1 to 3600. |
| `--codex-path` | *(found automatically)* | The path of a specific `codex.exe` or npm `codex.cmd` to use instead of the one that SpannBridge finds. |

**Environment variables.**  These apply when you start `node adapter.mjs` yourself.  The launcher sets them for you.

| Variable | Default | Meaning |
|---|---|---|
| `ADAPTER_PORT`, `ADAPTER_TOKEN`, `ADAPTER_MODEL`, `ADAPTER_EFFORT`, and `ADAPTER_TIMEOUT_MS` | as above | Same as the launcher options.  `ADAPTER_TIMEOUT_MS` is in milliseconds. |
| `CODEX_BIN` and `CODEX_BIN_ARGS_JSON` | *(found automatically)* | The program that runs the Codex CLI, and any arguments before `app-server`. |
| `ADAPTER_DEFAULT_MODEL` | `default` | The name of the alias for the default model. |

`http://127.0.0.1:8765/status` shows whether SpannBridge and the App Server are running and which model each model ID selects.  It answers without the API key, so you can use it to check whether SpannBridge is running.  It cannot send anything to Codex.

## Troubleshooting

Start with `node Start-SpannBridge.mjs --check-only`.  It finds most setup problems without sending anything.  [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting) describes each problem in more detail.

| Symptom | Fix |
|---|---|
| PowerShell says "running scripts is disabled on this system" | This is the Windows default setting.  SpannBridge does not need scripts.  Run the `node` commands in this guide.  You do not need to change the execution policy. |
| `No usable Codex CLI found`, or `codex` is "not recognized" | Use the `node Start-SpannBridge.mjs codex` command from step 3.  If it finds nothing, run `npm.cmd install -g @openai/codex`, reopen PowerShell, and check again. |
| `ChatGPT sign-in is required` | Run `node Start-SpannBridge.mjs codex login` and choose **Sign in with ChatGPT**. |
| The Codex CLI installer reports a missing `OSArchitecture` | Use the npm route in step 3.  See [DEPLOYMENT.md](DEPLOYMENT.md#installer-reports-missing-osarchitecture). |
| Sign-in works in the Codex app but not in SpannBridge | Run `node Start-SpannBridge.mjs codex login status` as the same Windows user that runs SpannBridge.  Keep any `CODEX_BIN` and `CODEX_HOME` settings the same for both. |
| `Port 8765 is unavailable` | SpannBridge is already running.  Look for its window.  Or start with `--port 8766` and change the Base URL in the Chatbot preferences. |
| `/status` returns 503, or "Codex App Server stopped" | The App Server stopped.  Restart SpannBridge and read the error in its window. |
| HTTP 401, or `refused, HTTP 401` in the SpannBridge window | The API key in the Chatbot preferences must equal the `--token` that you started SpannBridge with.  A blank API key gets this error whenever SpannBridge was started with `--token`. |
| `Tool calling is not enabled` | Clear **Tool calling** in the Chatbot preferences. |
| `Codex loaded local instruction files` | The Codex CLI found an instruction file, such as `AGENTS.md` in its home folder.  That folder is normally `.codex` in your user folder.  SpannBridge stops, because the file would change the Chatbot's instructions.  Move or rename the file that the message names, then send the message again. |
| `Model 'x' is not available` | Use an ID from the startup output or from `node Test-SpannBridge.mjs --check-only`. |
| `Remote image URLs are not supported`, or `Unsupported content type` | Attach images directly.  SpannBridge does not support other attachment types. |
| `Codex completion timed out.` | Start SpannBridge with `--timeout-seconds 600`, or with a lower `--effort`. |
| Long pause before the reply text | The model may be thinking.  The reply appears when the App Server sends it.  Older versions of the App Server may send only complete messages. |
| A reply ends with `[adapter error]` | The request failed after SpannBridge started the reply.  SpannBridge keeps any partial reply.  Read the SpannBridge window before you decide whether to resend. |
| Java Shell code runs, but nothing happens | Codex wrote the code as a Java class, which the Java Shell compiles but never runs.  Ask for "plain Java Shell statements on `model`, no class".  Start from a blank model so that names such as `comp1` are free. |
| The Java Shell shows `unreported exception java.io.IOException` | A file operation needs a `try`/`catch` block in the Java Shell.  Send the error to the Chatbot and ask for a fix. |

## Limitations

- **Tool calling must stay off.**  The Chatbot's documentation search needs the chat *client* to run the search tool.  SpannBridge does not translate tool calls.  If the Chatbot sends tools, SpannBridge returns an error.
- **Streaming depends on the App Server.**  Older versions may send only complete messages.  SpannBridge does not forward commentary or reasoning text.
- **One user, one PC.**  SpannBridge listens only on 127.0.0.1 and refuses requests from web pages.  Do not make it reachable from a network, and do not share it.  See [Is this allowed?](#is-this-allowed-check-before-you-run-it).  Without `--token`, other programs on your PC could use your plan through SpannBridge.
- **Codex runs with your own Windows permissions.**  SpannBridge requests a read-only sandbox, turns off optional tools, and declines every request for approval.  The tool settings are program options, not an operating-system sandbox.  The setup is not a hardened isolation boundary.
- SpannBridge does not pass on the Chatbot's `temperature`, maximum-token, and response-format settings.
- If SpannBridge is stopped abruptly, temporary images can stay in `runtime/<port>/`.  The next start on that port deletes the files left there, except `.gitignore`.  SpannBridge leaves the files of other ports alone.
- SpannBridge makes no automatic retries.  If Codex fails, you see the error and decide whether to resend.
- SpannBridge was tested on Windows only.

## If you are reading this in the future

SpannBridge connects three products that change on their own schedules: the Codex CLI, OpenAI's models and policies, and COMSOL Multiphysics® software.  This section lists what is likely to change and how to check it.

### OpenAI's rules and usage limits

OpenAI can change its rules and usage limits.  Use the checklist in [How to check the current rules](#how-to-check-the-current-rules) before you rely on SpannBridge.

### Model names

- Model names, defaults, effort levels, context windows, image support, and retirement dates change.  Run `node Test-SpannBridge.mjs --check-only` to see today's model list.  It shows the model list only, not whether a request will succeed.
- SpannBridge finds new versions named `gpt-<version>-<family>` automatically after a restart.  A new family name or a new naming pattern needs a change to the code.
- An exact ID stops SpannBridge from switching versions, but it cannot stop OpenAI from retiring that model.  The family names cannot unlock a model that OpenAI has not enabled for your account.

### The Codex CLI itself

- Update the Codex CLI in the same way that you installed it: with npm, or with the Codex app's own updater.  Do not run a separate updater on the copy inside the Codex app.
- The App Server's messages, the Codex CLI's options, and the app's internal folders can change.  After an update, run the `--check-only` checks again.  If SpannBridge stops finding the copy inside the Codex app, install the npm package and set `--codex-path` to it.
- Check OpenAI's [Codex changelog](https://learn.chatgpt.com/docs/changelog) first when something changes.

### COMSOL Multiphysics® software

Later versions of COMSOL Multiphysics® may change the Chatbot preferences, add providers, handle tool calling differently, or run the Chatbot on Mac and Linux.  They may also change how attachments and the Java Shell work.  SpannBridge was tested only with version 6.4.  Check *Chatbot Preference Settings* in the COMSOL® documentation for your version.  SpannBridge accepts any address that ends in `chat/completions`, so it keeps working if the form of the Base URL changes.  The SpannBridge window logs every request, so it is the first place to look when something changes.

On 16 September 2026, COMSOL AB announced COMSOL Multiphysics® version 2027 for release in fall 2026 ([press release](https://www.comsol.com/press-release/system-level-modeling-and-agentic-ai-take-the-spotlight-in-comsol-multiphysics-version-2027-14722)).  It adds the COMSOL® MCP Server.  The server uses the Model Context Protocol (MCP), a standard way for AI agents to use outside tools, so that external AI agents can work with COMSOL Multiphysics® directly through its API.  This is a different route from SpannBridge, which connects an AI service to the Chatbot window.

### Node.js

SpannBridge has no npm dependencies of its own and needs Node.js 18 or newer.  Use a supported LTS release.  The Codex CLI may need a newer version of Node.js than SpannBridge does.

### Mac and Linux

The Chatbot in COMSOL Multiphysics® 6.4 is Windows-only, so this release targets Windows.  `adapter.mjs`, `Start-SpannBridge.mjs`, and `cli.mjs` use Node.js.  SpannBridge was tested on Windows only.

Developers who adapt SpannBridge should also read the [DEEP-DIVE.md](https://github.com/SpannAI/spannbridge-cli/blob/main/DEEP-DIVE.md) of the Claude Code edition.

## Reporting a problem and contact

To report a bug, open an issue on GitHub, so that other users can see the problem and its fix.  Include this information:

- the SpannBridge release
- the output of `node Start-SpannBridge.mjs codex --version`
- your Node.js and COMSOL Multiphysics® versions
- the Model id
- the lines in the SpannBridge window around the problem

Before you post, remove account details, any `--token` value, paths that contain your user name, and any confidential model content.

For a security problem, or for anything else that should not be public, email [spannbridge@spann.ai](mailto:spannbridge@spann.ai).  Use the same address for other questions about SpannBridge.  Do not send passwords, API keys, or confidential model files.  SpannBridge is a free tech demo with no support agreement, so a reply or a fix is not guaranteed.

## Using the OpenAI API directly instead

The Chatbot can also use OpenAI directly, with **no SpannBridge**.  This route bills per token to an OpenAI API key.  It is the supported route for work use and for anything beyond personal experiments.  It is also the route to use if OpenAI stops allowing use through a ChatGPT plan.

| Setting | Value |
|---|---|
| Provider | **OpenAI** |
| Model id | A current OpenAI API model.  See OpenAI's [models page](https://platform.openai.com/docs/models). |
| Tool calling | On.  The Chatbot's documentation search works on this route. |
| API key | A key from [platform.openai.com](https://platform.openai.com/).  Set a spending limit. |

## Other AI providers

**Grok Build and Muse Code.**  To the best of our knowledge, SpannBridge could be adapted to two other official command-line programs that you sign in to with a subscription: Grok Build (`grok`) from xAI and Muse Code (`muse`) from Meta.  Muse Code has a session server, `muse serve`, which is the closest equivalent to the App Server that this edition uses.  Grok Build has a headless mode that is closer to the design of the Claude Code edition.  Spann Engineering Consulting LLC has not tested either adaptation.  It is also not confirmed that these modes use the subscription rather than a separately billed API key.  Section 8 of the Claude Code edition's [DEEP-DIVE.md](https://github.com/SpannAI/spannbridge-cli/blob/main/DEEP-DIVE.md) has notes on both programs and a checklist for the adaptation.  If an AI coding assistant helps you, have it read that file first, because the file was written for that use.  Read each vendor's current terms and billing rules before you start.

**Google Gemini.**  Do not adapt SpannBridge to a Google AI subscription because Google's current terms prohibit this structure.  On 18 June 2026, Gemini CLI stopped accepting sign-in with a Google AI Pro or Ultra subscription ([Google's notice](https://developers.google.com/gemini-code-assist/docs/deprecations/code-assist-individuals)).  Those subscriptions now work with Google's Antigravity products.  The [Antigravity terms](https://antigravity.google/terms) state that the use of third-party software, tools, or services to access the service is a breach of the agreement.  An adapted SpannBridge would be such third-party software.  In February 2026, Google suspended the accounts of subscribers who used such tools ([Google's post](https://github.com/google-gemini/gemini-cli/discussions/20632)).

**The paid APIs.**  xAI, Meta, and Google also sell API access through OpenAI-compatible addresses.  The Chatbot can use those addresses directly without SpannBridge.

This section describes the vendors' public pages as read on 3 October 2026.  It is not legal advice.

## What the MIT License means for you

SpannBridge is free, open-source software.  Its copyright holder is Spann Engineering Consulting LLC.  It is released under the [MIT License](LICENSE), a short and widely used license that allows almost any use of the code.  In plain terms:

- **You can use it for anything,** including paid engineering and consulting work, without paying or asking permission.
- **Your work is yours.**  Spann Engineering Consulting LLC claims no ownership of, rights in, or credit for anything you create while you use SpannBridge.  This includes models, code, Chatbot answers, calculations, reports, and designs.
- **Using SpannBridge requires no acknowledgment.**  You do not need to mention SpannBridge or Spann Engineering Consulting LLC anywhere when you use it to get Chatbot answers for an engineering project.
- **The license's only condition concerns redistribution of SpannBridge's own code.**  If you copy, share, or publish SpannBridge's source files, changed or unchanged, keep the copyright notice and the license text with them.
- **No warranty and no liability.**  SpannBridge is provided "as is".  Spann Engineering Consulting LLC accepts no liability for SpannBridge or for anything produced with it.  You are responsible for checking results.  See [Check the engineering](#check-the-engineering).
- **Other companies' terms still apply.**  The MIT License covers SpannBridge only.  It does not grant you access to OpenAI's services or change their terms.  Your agreement with OpenAI governs your use of ChatGPT and Codex.  Your license agreement with COMSOL AB governs your use of COMSOL Multiphysics® software.

This summary is for convenience.  The [LICENSE](LICENSE) file is the legal text.

## Publisher, trademarks, and affiliation

**Publisher.**  Spann Engineering Consulting LLC publishes SpannBridge and holds its copyright.  Andrew Spann, the founder and owner of Spann Engineering Consulting LLC, created SpannBridge.  Spann Engineering Consulting LLC is the company's legal name.  *Spann.AI* is its brand name.  The website [spann.ai](https://spann.ai) belongs to the same company.  In this repository, "Spann.AI" and "Spann Engineering Consulting LLC" both refer to that one company.  The contact address for SpannBridge is [spannbridge@spann.ai](mailto:spannbridge@spann.ai).

**COMSOL AB.**  **This GitHub repository is neither developed by nor endorsed by COMSOL AB.**  This repository and its software are not affiliated with COMSOL AB.  COMSOL AB has not authorized, sponsored, or approved them and is not otherwise connected to them.  Spann Engineering Consulting LLC is a COMSOL® Certified Consultant.  That certification does not mean that COMSOL AB authorized, sponsored, or approved this project.

**OpenAI.**  This repository is not developed, endorsed, or sponsored by OpenAI.

**Trademarks.**  COMSOL and COMSOL Multiphysics are registered trademarks of COMSOL AB.  OpenAI, ChatGPT, and Codex are trademarks of OpenAI.  Anthropic, Claude, and Claude Code are trademarks of Anthropic PBC.  Other names in this repository, such as xAI, Grok, Meta, Muse, Google, Gemini, and Antigravity, are trademarks of their respective owners.  This repository uses these names only to identify those companies and their products.  Your agreement with OpenAI governs your use of ChatGPT and Codex.  Your license agreement with COMSOL AB governs your use of COMSOL Multiphysics® software.  See [the trademark guidelines of COMSOL AB](https://www.comsol.com/trademarks).
