#!/usr/bin/env bash
# PreToolUse(Bash) hook: steer file operations to the right tool — Read/Edit/Write for
# reading and editing, and the rg (ripgrep)/fd CLIs for searching and finding. (This Claude Code
# build removed the native Grep/Glob tools, so searches/finds are steered to those allowlisted
# CLIs rather than to a native tool that no longer exists.)
#
# Modes (see MODE below): "deny" blocks the command and redirects to the right tool (Read/Edit
# for reads/edits, rg/fd for searches/finds); "warn" allows the command through but injects
# the same advice as context. Use "warn"
# to confirm the hook fires on the right commands without disrupting work, then switch
# to "deny" to enforce.
#
# Escape hatch (Tier 2 & Tier 3): append '# native-tool-exempt' to a command and the hook
# returns an explicit "ask" decision so a human is the final gate even for allowlisted
# commands. CRITICAL: the token is honored ONLY when the command would otherwise be flagged
# by Tier 2 (a shell read/search) or Tier 3 (an interpreter one-liner). On any other command —
# git, ls, pnpm, etc. — the token is ignored and the command passes through untouched. This
# prevents the token from turning an already-allowlisted, zero-prompt command into an "ask"
# prompt, which is what happens if the hatch fires on token-presence alone. In-place edits
# (Tier 1) ignore the escape entirely: the Edit tool always works, so there is never a
# legitimate need for sed -i / perl -i.
#
# Fail-open: any error reading the payload exits 0 (allow) so a broken hook never wedges Bash.

MODE="deny"   # "warn" = allow + inject advice | "deny" = block and redirect to the tool

cmd="$(jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -z "$cmd" ] && exit 0

# Block the call; the reason is shown to Claude, which should switch to the native tool.
deny() { jq -n --arg r "$1" \
  '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'; exit 0; }
# Ask for human approval; used by the explicit escape hatch.
ask() { jq -n --arg r "$1" \
  '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:$r}}'; exit 0; }
# Allow the call but inject advice (warn mode / rollout).
warn() { jq -n --arg r "$1" \
  '{hookSpecificOutput:{hookEventName:"PreToolUse",additionalContext:$r}}'; exit 0; }
# Apply the configured mode (Tier 1: no escape hatch).
flag() { if [ "$MODE" = "deny" ]; then deny "$1"; else warn "$1"; fi; }

# Is the explicit exemption token present? Honored only inside flag2 (Tier 2), never alone.
exempt=0
printf '%s' "$cmd" | grep -Eq '# native-tool-exempt[[:space:]]*$' && exempt=1

# Tier 2 flag: a genuine, token-bearing exemption asks for a human gate; otherwise enforce.
# Because this is reached ONLY when a Tier 2 pattern matched, the token can never spuriously
# prompt an unrelated command.
flag2() {
  if [ "$exempt" = "1" ]; then
    ask "Explicit '# native-tool-exempt' on a shell file-op. Approve only if the Read tool or rg/fd genuinely cannot do this."
  else
    flag "$1"
  fi
}

# --- Shared normalization: explode statements so BOTH tiers see a file-op that is wrapped
# in a separator, '||', '$( … )', process substitution '<( … )'/'>( … )', or backticks as a
# line start. ---
# Built ONCE, before Tier 1, so the Tier-1 regex (anchored on '(^|[|&;])') also fires on an
# in-place edit pulled out of a command substitution (`echo "$(sed -i …)"`) or backticks —
# previously a blind spot, because '(' / '`' are not in that anchor class and the old
# normalization fed only the Tier-2 loop.
#   '||' -> newline (bash)          file-op after it (`false || cat f`) is inspected;
#   '$(' -> newline (bash)          file-op inside command substitution is inspected;
#   '<(' '>(' -> newline (bash)     file-op inside process substitution (`diff <(sed -n …) …`,
#                                   `wc -l <(head …)`) is inspected — the inner read/search is the
#                                   real file-op; the dangling '<'/'>' on the prior line is inert;
#   '&' ';' ')' '`' -> newline (tr) split statements / terminate a substitution body /
#                                   legacy backtick command substitution.
# Only '$('/'<('/'>(' (never a bare '(') opens a substitution split, so quoted/literal parens like
# `echo "(cat is an animal)"` keep `cat` mid-fragment and are NOT flagged. Single '|' is
# left intact for the Tier-2 head/tail split. tr is used (not sed) because BSD/macOS sed
# won't emit '\n' from a replacement. This intentionally favors practical coverage over
# perfect shell parsing — e.g. a literal ')' immediately followed by `sed -i`-shaped text
# in a string can false-positive, the same accepted trade-off the Tier-2 split already makes.
norm="${cmd//||/$'\n'}"                            # '||' -> newline
norm="${norm//\$(/$'\n'}"                          # '$(' -> newline (command-substitution open)
ps_in='<('; ps_out='>('                            # literal proc-subst opens held in vars so bash
norm="${norm//"$ps_in"/$'\n'}"                     #   doesn't parse '<('/'>(' as actual substitution
norm="${norm//"$ps_out"/$'\n'}"                    # '<(' / '>(' -> newline (process substitution)
norm="$(printf '%s\n' "$norm" | tr '&;)`' '\n')"   # '&' ';' ')' '`' -> newline
# NB: the surrounding $() strips trailing newlines, so a command ending in a bare '&'/';' loses the
# empty final segment. Harmless: that segment's delimiter is already consumed and there's nothing
# after it to inspect.
# Strip leading env-var assignments at each statement start so the tool TOKEN is what the tier
# matchers see. `NO_COLOR=1 grep …` / `LC_ALL=C sed -i …` would otherwise hide the command behind
# the assignment and slip past BOTH tiers — and a leading `NO_COLOR=1` is a legitimate shape (for
# tools with no color flag), so this is a real, self-inflicted hole.
# Done here (not per-tier) because Tier 1 greps this same
# blob and Tier 2 reads it line-by-line. sed is safe in THIS spot — it strips a leading prefix, it
# never emits a '\n' (the BSD-sed caveat above is only about emitting newlines). Only `WORD=value`
# tokens followed by whitespace are dropped, so a mid-command `--color=auto` or a bare `make CC=gcc`
# (no `=`-before-space at the head) is untouched.
norm="$(printf '%s\n' "$norm" | sed -E 's/^([[:space:]]*)([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)+/\1/')"

# --- Tier 1: in-place file edits -> Edit/Write. No escape token (Edit always works). ---
# Greps the normalized text so substitution/backtick-wrapped edits anchor at a line start.
if printf '%s\n' "$norm" | grep -Eq '(^|[|&;]) *sed +([^|&;]* )?-i[^[:space:]]*([[:space:]]|$)|(^|[|&;]) *sed +([^|&;]* )?--in-place([=[:space:]]|$)|(^|[|&;]) *perl +([^|]* )?-[A-Za-z0-9]*i'; then
  flag "Use the Edit/Write tool for in-place edits, not 'sed -i'/'perl -i' — no permission prompt and reversible."
fi

# --- Tier 3: arbitrary-code interpreter one-liners (`python3 -c`, `node -e`/`--eval`, `perl -e`,
# `ruby -e`, plus `tsx`/`ts-node -e`) -> a structured tool or a real file. Denied in favour of
# faster, structured tools; they are reserved for genuine multi-step aggregation.
# Unlike Tier 1 they HONOR the escape hatch (which downgrades the deny to an ask), because such
# aggregation is a legitimate (if rare) need.
# perl with an in-place flag (`-i`/`-pi`) is already caught by Tier 1 (which exits first), so only
# execute-mode perl (`-e`/`-pe`/`-ne`, no `-i`) reaches here.
#
# Tier 3 ALSO sees through JS/TS-runner wrappers: a `t3norm` variant of `norm` strips a leading
# `pnpm exec`/`pnpm dlx`/`npm exec`/`npx`/`bunx`/`yarn dlx`/`yarn exec` so a wrapped one-liner
# (`pnpm exec node -e …`, `npx tsx -e …`) is steered like its bare form. This is Tier-3-scoped
# (Tier 1/2 keep matching the un-stripped `norm`), and the matchers stay specific —
# `pnpm exec jest`/`pnpm exec prisma generate` expose a non-interpreter token and pass clean.
#   - Anchored on `(^|[|])` so wrappers are stripped at a statement head AND after a pipe
#     (`git log | pnpm exec node -e …`), matching the Tier-3 `(^|[|&;])` anchor below. `g` so
#     repeated/chained wrappers on one line all go.
#   - `[[:space:]]+` between/after wrapper words, so multiple spaces or tabs (`pnpm  exec`,
#     `pnpm\texec`) don't defeat the strip.
# Remaining edge: a wrapper carrying its OWN flags (`npx -y tsx -e`) still slips (the flag sits
# before the tool), the same practical-parsing trade-off the other tiers make.
t3norm="$(printf '%s\n' "$norm" | sed -E 's/(^|[|])([[:space:]]*)((pnpm[[:space:]]+exec|pnpm[[:space:]]+dlx|npm[[:space:]]+exec|npx|bunx|yarn[[:space:]]+dlx|yarn[[:space:]]+exec)[[:space:]]+)+/\1\2/g')"
if printf '%s\n' "$t3norm" | grep -Eq '(^|[|&;]) *python[0-9.]* +([^|&;]* )?-c([[:space:]]|$)|(^|[|&;]) *node +([^|&;]* )?(-e|--eval)([[:space:]=]|$)|(^|[|&;]) *perl +([^|&;]* )?-[A-Za-z0-9]*[eE]([[:space:]]|$)|(^|[|&;]) *ruby +([^|&;]* )?-e([[:space:]]|$)|(^|[|&;]) *(tsx|ts-node) +([^|&;]* )?-e([[:space:]]|$)'; then
  if [ "$exempt" = "1" ]; then
    ask "Explicit '# native-tool-exempt' on an interpreter one-liner. Approve only for genuine multi-step aggregation no shell/JSON tool can do."
  else
    flag "Interpreter one-liners ('python3 -c'/'node -e'/'perl -e'/'ruby -e'/'tsx -e') are denied here in favour of faster, structured tools — use jq (or gh --jq) for JSON, the Edit/Write tool for file changes, or write a real spec and run it via 'pnpm exec jest'. For genuine multi-step aggregation no shell/JSON tool can do, append '# native-tool-exempt' (downgrades this deny to a human approval prompt)."
  fi
fi

# --- Tier 2: reading / searching files in shell -> Read tool / rg / fd. ---
# Inspect each statement's pipeline HEAD — the part before the first '|'. Only a pipeline's
# head receives file arguments; everything downstream reads stdin, so `… | tail -20` and
# `… | grep foo` are stdin filters and must NOT be flagged.
# Fed by a here-string, NOT a pipe: a `cmd | while` loop runs the body in a SUBSHELL, so an
# `exit` inside flag2/ask/deny would terminate only that subshell, not the hook — leaving the
# parent to fall through. Reading from `<<<` keeps the loop in the parent shell, so the first
# deny/ask deterministically terminates the whole hook (and can't be defeated if the decision
# signaling ever moves from stdout JSON to an exit code).
while IFS= read -r stmt; do
  head_cmd="${stmt%%|*}"                                # pipeline head only (before first '|')
  head_cmd="${head_cmd#"${head_cmd%%[![:space:]]*}"}"   # left-trim
  case "$head_cmd" in
    *[[:space:]]"<<"*)
      # Heredoc (`cat <<EOF`, `cat <<-EOF`) or here-string (`cat <<< x`) feeds stdin, NOT a file —
      # nothing to Read, so don't steer. Falls through to the heredoc permission gate. Anchored on
      # whitespace-before-`<<` (the redirection-operator form) so a quoted `<<` *inside a search
      # pattern* — e.g. `grep -rn '<<<<<<<' .` for conflict markers — is NOT suppressed: it has a
      # quote, not whitespace, before `<<`, so it still reaches the grep matcher and is steered to
      # rg. (A bare `<` file-redirect has no `<<` and likewise falls through to the read cases.)
      : ;;
    sed\ -*)
      # Only a sed whose FIRST token is a flag cluster containing -n (auto-print suppressed) is a
      # read/search: -n, -En, -nE, -rn, etc. A transform without -n (`sed -E 's/a/b/' f`) prints to
      # stdout and is left alone — so skip unless -n is present. Anchor the n-test to the flag token
      # (`-[A-Za-z]*n`) so an 'n' in the *filename* (`index.ts`, `GreenButton.ts`) never trips it.
      printf '%s' "$head_cmd" | grep -Eq '^sed[[:space:]]+-[A-Za-z]*n' || continue
      # -n present: a /regex/ address (`sed -n '/foo/p'`, `sed -En '/foo/p'`, `sed -nE '/foo/p'`) is
      # a SEARCH -> rg; a line range (`sed -n '5,10p'`) is a slice -> Read. Distinguish by whether the
      # expression right after the flag cluster opens with a '/' (anchored there so a '/' in the
      # *path* — e.g. `apps/x.ts` — never trips it). The `n` may sit anywhere in the cluster, so allow
      # more flag letters after it (`-nE`). `s///p` is an imperfect edge that routes to rg.
      if printf '%s' "$head_cmd" | grep -Eq "sed[[:space:]]+-[A-Za-z]*n[A-Za-z]*[[:space:]]+['\"]?/"; then
        flag2 "Use rg to search files, not 'sed -n /re/p' — a pattern-address print is a search, not a range read."
      else
        flag2 "Use the Read tool (offset/limit) to read a file, not 'sed -n' line-range printing."
      fi ;;
    cat\ *|head\ *|tail\ *)
      flag2 "Use the Read tool (offset/limit) to read a file, not '$(printf '%s' "$head_cmd" | awk '{print $1}')'." ;;
    grep\ *|egrep\ *|fgrep\ *)
      # Only pipeline HEADS reach here (stdin filters like `… | grep x` are downstream and skipped).
      # `git grep` is intentionally NOT matched (its head is `git`, not a bare `grep`): it is
      # gitignore-aware and fast, so it stays allowlisted and unsteered — only a bare grep is steered.
      # rg is the sanctioned tool and is NOT steered; grep/egrep/fgrep ARE. A head-position grep with a
      # pattern is treated as a file search; a head-position `grep foo` with no upstream/file is a
      # degenerate stdin read that hangs anyway, so flagging it is harmless. Require one non-flag arg so
      # that `grep --help` and bare `grep` (no pattern) don't trip; a path arg is no longer required, so
      # path-less searches (`grep -rn foo`) are caught too.
      # First branch: the first non-flag token is the pattern (doesn't start with '-'). Second
      # branch handles a `--` end-of-options separator followed by any token, so a dash-leading
      # pattern (`grep -- -foo`) is still recognized as a real search. The `--` branch needs a
      # non-empty token *after* the separator, so `grep --version` (no ` -- token`) stays CLEAN.
      if printf '%s' "$head_cmd" | grep -Eq '^(grep|egrep|fgrep)([[:space:]]+-[^[:space:]]+)*[[:space:]]+[^-]' \
        || printf '%s' "$head_cmd" | grep -Eq '^(grep|egrep|fgrep)([[:space:]]+[^[:space:]]+)*[[:space:]]--[[:space:]]+[^[:space:]]'; then
        flag2 "Use rg (ripgrep) to search files, not shell grep — most flags carry over (-n, -i, -l, -c, -e, -f), faster, allowlisted. Note: rg skips .gitignored/hidden files by default; add -uuu to search everything."
      fi ;;
    find\ *)
      flag2 "Use fd to locate files, not find — note fd has DIFFERENT syntax (fd PATTERN [PATH], -t f, -e ext, -x CMD) and skips .gitignored/hidden by default (add -HI to include them)." ;;
  esac
done <<< "$norm"

exit 0   # everything else proceeds untouched
