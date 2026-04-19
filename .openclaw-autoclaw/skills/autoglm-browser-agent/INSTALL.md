# AutoGLM Browser Agent — Installation Guide

This document describes all the steps required for first-time installation. For daily usage after installation, please refer to `SKILL.md`.

---

## 1. Choose a Browser (Required)

**⚠️ You must first confirm which browser the user is using. All subsequent steps depend on this choice.**

**Ask the user**:

> Which browser do you use?
> - **Chrome**
> - **Edge**

After the user chooses, write to the configuration file:

```bash
# macOS / Linux
mkdir -p ~/.openclaw-autoclaw

# If the user chose Chrome
echo '{"browser": "chrome"}' > ~/.openclaw-autoclaw/config.json

# If the user chose Edge
echo '{"browser": "edge"}' > ~/.openclaw-autoclaw/config.json
```

```bat
:: Windows
if not exist "%USERPROFILE%\.openclaw-autoclaw" mkdir "%USERPROFILE%\.openclaw-autoclaw"

:: If the user chose Chrome
echo {"browser": "chrome"} > "%USERPROFILE%\.openclaw-autoclaw\config.json"

:: If the user chose Edge
echo {"browser": "edge"} > "%USERPROFILE%\.openclaw-autoclaw\config.json"
```

> You can switch at any time by saying "use Edge" / "use Chrome".

---

## 2. Remove macOS Security Restrictions (macOS Only)

After the first download, macOS will block unsigned binaries from running. Execute the following command to remove the restriction:

```bash
xattr -d com.apple.quarantine {baseDir}/dist/relay {baseDir}/dist/mcp_server {baseDir}/dependency/mcporter
```

> Windows users can skip this step.

---

## 3. Install the Browser Extension

Based on the browser chosen in Step 1, install the corresponding extension:

**Chrome / Brave / Arc**:

Open the link to install: [AutoGLM Extension (Chrome Web Store)](https://chromewebstore.google.com/detail/autoglm/jelniggicmclhfgnlapbkgfibmgelfnp?hl=zh-CN&utm_source=ext_sidebar)

**Edge**:

Open the link to install: [AutoGLM Extension (Edge Add-ons)](https://microsoftedge.microsoft.com/addons/detail/autoglm/ljlnbmmmgnflklegiafalpieckpihffn)

**Post-installation verification**:

1. Open `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
2. Confirm the AutoGLM extension is present and the toggle is **enabled**
3. If the extension is disabled, click the toggle to enable it

---

## 4. Register MCP Server

mcporter is already included in the `{baseDir}/dependency/` directory; no separate installation is needed.

**macOS / Linux**:

```bash
{baseDir}/dependency/mcporter config add autoglm-browser-agent --stdio "{baseDir}/dist/mcp_server --start_url https://www.bing.com --window_width 1456 --window_height 819 --resize_width 1456 --resize_height 819 --max_steps 100 --log_dir {baseDir}/mcp_output --if_subagent"
```

**Windows** (cmd recommended):

```bat
{baseDir}\dependency\mcporter.exe config add autoglm-browser-agent --command "{baseDir}\dist\mcp_server.exe" --arg --start_url --arg https://www.bing.com --arg --window_width --arg 1456 --arg --window_height --arg 819 --arg --resize_width --arg 1456 --arg --resize_height --arg 819 --arg --max_steps --arg 100 --arg --log_dir --arg "{baseDir}\mcp_output" --arg --if_subagent
```

Verify that the registration was successful:

```bash
# macOS / Linux
{baseDir}/dependency/mcporter list autoglm-browser-agent --schema

# Windows
{baseDir}\dependency\mcporter.exe list autoglm-browser-agent --schema
```

---

## 5. Start the WS Relay Daemon

The Relay maintains a persistent WebSocket connection with the browser extension, preventing the browser window from closing after an mcporter call ends.

```bash
# macOS / Linux
{baseDir}/dist/relay

# Windows
{baseDir}\dist\relay.exe
```

Logs are written to `{baseDir}/mcp_output/relay.log`.

---

## 6. Configure Trust Mode (auto_approve)

Trust mode controls whether sensitive operations (posting comments, liking, publishing posts, sending messages, etc.) are executed automatically:
- **Off (default)**: Each sensitive operation pauses and asks for user confirmation before executing
- **On**: Sensitive operations are executed automatically without asking for confirmation each time
- **Regardless of the setting, login and CAPTCHA always require manual user action**

**Ask the user whether to enable trust mode**, and write to the configuration based on their answer (merged into the same config.json as the browser choice from Step 1):

```bash
# macOS / Linux — Read the existing config.json and merge the auto_approve field
# If the user agrees to enable trust mode: merge auto_approve: true into the file
# If the user declines: merge auto_approve: false into the file
```

> **Note**: Step 1 already wrote the browser field. Here you need to **merge** the write (read the existing config.json, add the auto_approve field, and write it back) — do not overwrite the existing configuration.

> During subsequent usage, the user can switch at any time by saying "enable/disable trust mode".
