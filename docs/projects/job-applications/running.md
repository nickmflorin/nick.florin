# Running the Job Hunt

A run discovers postings, scores them, applies to the approved ones unattended, and ends with one
report — the `job-hunt` skill's **Unattended Run**. There are three ways to start one. Runs start
**on demand** today (decided 2026-10-04); the other two are written up here so that switching is a
matter of following the steps.

Whichever way a run starts, it needs the same three things in place:

- the job-search Chrome running, which every run launches itself with
  `pnpm --silent jobs browser launch`;
- LinkedIn signed in in that window — or `signIn.automatic` on with its credentials in `.env.local`;
- the Mac awake and logged in. Nothing here runs in the cloud: the browser profile and the private
  data directory are local.

## 1. On Demand

Ask for a run in a Claude Code session in this repository:

```text
Run the job hunt.
```

The skill runs every step without stopping to ask, and reports at the end. This is the default, and
the only method that needs nothing installed.

## 2. A Schedule Inside a Session

Claude Code can repeat a prompt on a schedule for as long as a session stays open. In a session in
this repository:

```text
/loop 24h Run the job hunt.
```

Or ask for a calendar schedule, which uses the `CronCreate` tool:

```text
Every weekday at about 9am, run the job hunt.
```

- **Nothing is installed**, and it stops when the session closes.
- **Recurring schedules expire after seven days**, and must be set again.
- **Runs wait while the session is busy**: a scheduled run starts only when the session is idle.

## 3. A macOS LaunchAgent (True Background)

A LaunchAgent starts a headless Claude Code run at set times, with VS Code closed. It runs an agent
with browser and CLI permissions unattended on the Mac, so it is allowed only the tools a run needs.

### Install

Create `~/Library/LaunchAgents/com.nickflorin.job-hunt.plist`, adjusting the schedule, the
repository path and the PATH to match the machine (`which pnpm claude` shows the directories PATH
needs):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.nickflorin.job-hunt</string>
    <key>WorkingDirectory</key>
    <string>/Users/nickflorin/repos/nick.florin</string>
    <key>ProgramArguments</key>
    <array>
      <string>/bin/zsh</string>
      <string>-lc</string>
      <string>
        pnpm --silent jobs browser launch &amp;&amp;
        claude -p "Run the job hunt." \
          --allowedTools "Bash(pnpm --silent jobs:*)" "mcp__job-search-browser" "Agent" \
          >> "$HOME/job-search/logs/$(date +%F).log" 2>&amp;1
      </string>
    </array>
    <key>StartCalendarInterval</key>
    <array>
      <dict><key>Weekday</key><integer>1</integer><key>Hour</key><integer>9</integer><key>Minute</key><integer>7</integer></dict>
      <dict><key>Weekday</key><integer>2</integer><key>Hour</key><integer>9</integer><key>Minute</key><integer>7</integer></dict>
      <dict><key>Weekday</key><integer>3</integer><key>Hour</key><integer>9</integer><key>Minute</key><integer>7</integer></dict>
      <dict><key>Weekday</key><integer>4</integer><key>Hour</key><integer>9</integer><key>Minute</key><integer>7</integer></dict>
      <dict><key>Weekday</key><integer>5</integer><key>Hour</key><integer>9</integer><key>Minute</key><integer>7</integer></dict>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
      <key>PATH</key>
      <string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string>
    </dict>
  </dict>
</plist>
```

Then create the log directory and load the agent:

```bash
mkdir -p ~/job-search/logs
launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.nickflorin.job-hunt.plist
```

`claude -p` runs one prompt non-interactively and exits. Its `--allowedTools` list is what the run
may do without asking — the `jobs` CLI, the job-search browser and the scoring and cover-letter
agents — and anything else is refused, since no one is there to approve it. The deny rules in
`.claude/settings.json` still apply: the agent cannot approve a resume or a cover letter, or read
`.env.local`. Check the flags against `claude --help` for the installed version before loading.

### Run Once Now, Inspect and Uninstall

```bash
# Start a run immediately, outside the schedule.
launchctl kickstart -k "gui/$(id -u)/com.nickflorin.job-hunt"

# Read the day's log: the run's report is at the end.
tail -n 80 ~/job-search/logs/$(date +%F).log

# Uninstall: stop the schedule and remove the agent.
launchctl bootout "gui/$(id -u)/com.nickflorin.job-hunt"
rm ~/Library/LaunchAgents/com.nickflorin.job-hunt.plist
```

### What Changes When Runs Are Scheduled

- **The report goes to the log**, not to a conversation: read it, then answer held questions and
  approve cover letters in a session as usual (`jobs apply held`, `jobs cover-letter show`).
- **A lapsed LinkedIn session ends the run** as `logged-out` unless automatic sign-in is on; the log
  says so.
- **A time missed while the Mac slept runs once on waking**: launchd catches up a calendar job a
  single time, however many times were missed.
