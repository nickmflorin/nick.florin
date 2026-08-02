#!/usr/bin/env bash
# Golden-input regression tests for the prefer-native-tools PreToolUse hook.
#
# Each case asserts the hook's DECISION (deny | ask | clean) for a command STRING.
# The hook only inspects the string — nothing is executed — so these are pure and fast.
#
# cspell:ignore noverc tsnode npxflag sedrange sedsearch interp sedi perli inplace pathl xform
#
# Run:  bash .claude/hooks/prefer-native-tools.test.sh
# Exit: 0 = all pass, 1 = one or more failures (suitable as a pre-commit / CI gate).
#
# NOTE: assumes the hook's MODE="deny" (the committed default). In "warn" mode every
# flagged case returns clean (advice-only), so these deny-mode assertions would fail.

set -u
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK="$HOOK_DIR/prefer-native-tools.sh"
pass=0
fail=0
failed_cases=()

if ! command -v jq >/dev/null 2>&1; then
  echo "FATAL: jq is required to run these tests" >&2
  exit 2
fi
if ! grep -Eq '^MODE="deny"' "$HOOK"; then
  echo "WARNING: hook MODE is not \"deny\" — flagged cases will report clean and fail." >&2
fi

# decision <command> -> deny | ask | clean
decision() {
  local out
  out="$(jq -n --arg c "$1" '{tool_input:{command:$c}}' | bash "$HOOK")"
  [ -z "$out" ] && { echo clean; return; }
  printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // "clean"' 2>/dev/null
}

# reason <command> -> decision reason text
reason() {
  jq -n --arg c "$1" '{tool_input:{command:$c}}' \
    | bash "$HOOK" \
    | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null
}

# expect <want> <label> <command>
expect() {
  local want="$1" label="$2" cmd="$3" got
  got="$(decision "$cmd")"
  if [ "$got" = "$want" ]; then
    pass=$((pass + 1))
  else
    fail=$((fail + 1))
    failed_cases+=("[$label] want=$want got=$got :: $cmd")
  fi
}

# expect_reason <substring> <label> <command>  (reason must contain the substring)
expect_reason() {
  local sub="$1" label="$2" cmd="$3" r
  r="$(reason "$cmd")"
  if printf '%s' "$r" | grep -qF "$sub"; then
    pass=$((pass + 1))
  else
    fail=$((fail + 1))
    failed_cases+=("[$label] reason missing '$sub' :: $cmd")
  fi
}

echo "Running prefer-native-tools golden tests against: $HOOK"

# ── Tier 1: in-place edits → Edit/Write (deny, no escape hatch) ──────────────
expect deny t1-sed-i        "sed -i '' 's/a/b/' f.txt"
expect deny t1-sed-inplace  "sed --in-place 's/a/b/' f.txt"
expect deny t1-perl-i       "perl -i -pe 's/a/b/' f.txt"
expect deny t1-perl-0pi     "perl -0pi -e 's/a/b/' f.txt"
expect deny t1-in-subst     "echo \"\$(sed -i 's/a/b/' f.txt)\""
expect deny t1-after-or     "false || perl -i -pe 's/a/b/' f.txt"
expect deny t1-exempt-noop  "sed -i 's/a/b/' f.txt # native-tool-exempt"  # Tier 1 ignores the hatch
expect_reason "Edit/Write" t1-message "perl -0pi -e 's/a/b/' f.txt"

# ── Tier 2: shell reads → Read (deny) ───────────────────────────────────────
expect deny t2-cat          "cat nx.json"
expect deny t2-head         "head -20 tsconfig.json"
expect deny t2-tail         "tail -n 3 pnpm-workspace.yaml"
expect deny t2-sed-range    "sed -n '5,10p' CLAUDE.md"

# ── Tier 2: searches → rg / finds → fd (deny); rg/fd themselves clean ───────
expect deny  t2-grep        "grep -rn 'Foo' apps/src"
expect deny  t2-grep-pathl  "grep -rin 'Foo'"
expect deny  t2-egrep       "egrep -n 'A|B' f.ts"
expect deny  t2-fgrep       "fgrep 'Foo' apps/src"
expect deny  t2-find        "find packages -type f -name '*.ts'"
expect clean t2-rg          "rg -n 'Foo' apps/src"
expect clean t2-fd          "fd -e ts . packages"
expect clean t2-grep-vers   "grep --version"
expect clean t2-sed-xform   "sed 's/a/b/g' nx.json"

# ── sed flag clusters: -n regex → rg, -n range → Read, no -n → clean ────────
expect deny  sed-En-regex   "sed -En '/foo/p' nx.json"
expect deny  sed-nE-regex   "sed -nE '/foo/p' nx.json"
expect deny  sed-En-range   "sed -En '5,10p' CLAUDE.md"
expect clean sed-E-noN      "sed -E 's/a/b/g' nx.json"

# ── Pipeline heads vs downstream filters (stdin filters stay clean) ─────────
expect clean pipe-tail      "git status --short 2>&1 | tail -10"
expect clean pipe-grep      "git log --oneline -30 | grep -i fix"
expect deny  pipe-head-cat  "head -1 nx.json | jq -R ."

# ── Normalization: || / \$( ) / backtick / && / ; ───────────────────────────
expect deny  norm-or        "false || head -5 nx.json"
expect deny  norm-subst     "echo \"first: \$(head -1 nx.json)\""
expect clean norm-or-clean  "true || git diff --stat"
# ── Process substitution <( ) / >( ) — inner read/search is steered (v5.4) ──
expect deny  ps-sed-range   "diff <(sed -n '40,75p' a.md) <(sed -n '40,75p' b.md)"
expect deny  ps-grep        "diff <(grep foo a) <(grep foo b)"
expect deny  ps-head        "wc -l <(head -1 nx.json)"
expect deny  ps-cat         "diff <(cat a) <(cat b)"
expect deny  ps-out-grep    "tee >(grep foo > out)"
expect clean ps-sort-neg    "comm <(sort a) <(sort b)"
expect clean ps-literal-neg "echo 'see <(x) example'"

# ── Env-var prefix stripping + git grep non-steering ────────────────────────
expect deny  env-grep       "NO_COLOR=1 grep -rn 'Foo' apps/src"
expect deny  env-sed-i      "LC_ALL=C sed -i '' 's/a/b/' f.txt"
expect clean git-grep       "git grep parallel nx.json"

# ── Escape hatch: honored only when otherwise flagged ───────────────────────
expect ask   hatch-grep     "grep -rn 'Foo' apps/src # native-tool-exempt"
expect clean hatch-gitdiff  "git diff --stat # native-tool-exempt"
expect clean hatch-ls       "ls -la packages # native-tool-exempt"

# ── Allowlist baselines (sanity) ────────────────────────────────────────────
expect clean base-gitdiff   "git diff --stat"
expect clean base-ls        "ls -la packages"

# ── Tier 3: interpreters → structured tool (deny) ───────────────────────────
expect deny t3-py-c         "python3 -c 'print(1)'"
expect deny t3-py-noverc    "python -c 'print(1)'"
expect deny t3-py-versioned "python3.11 -c 'print(1)'"        # v5.2 python[0-9.]* fix
expect deny t3-node-e       "node -e 'console.log(1)'"
expect deny t3-node-eval    "node --eval '1+1'"
expect deny t3-node-eval-eq "node --eval='1+1'"
expect deny t3-perl-e       "perl -e 'print 1'"
expect deny t3-perl-pe      "perl -pe 's/a/b/' f.txt"
expect deny t3-perl-0e      "perl -0e 'print'"                 # v5.2 [A-Za-z0-9] numeric fix
expect deny t3-perl-0pe     "perl -0pe 's/a/b/' f.txt"        # numeric cluster, no -i
expect deny t3-perl-E       "perl -E 'say 1'"
expect deny t3-ruby-e       "ruby -e 'puts 1'"
expect deny t3-sep-and      "git status && python3 -c 'print(1)'"
expect deny t3-sep-semi     "echo hi; node -e 'x'"
expect deny t3-sep-pipe     "git log --oneline -3 | node -e 'x'"
expect deny t3-sep-subst    "echo \"v: \$(node -e 'console.log(1)')\""
expect deny t3-env-prefix   "PYTHONPATH=. python3 -c 'import x'"
expect_reason "jq" t3-message "python3 -c 'import json'"

# ── Tier 3: escape hatch (honored) ──────────────────────────────────────────
expect ask   t3-hatch       "python3 -c 'agg()' # native-tool-exempt"
expect_reason "interpreter one-liner" t3-hatch-msg "node -e 'x' # native-tool-exempt"

# ── Tier 3: negatives (must stay clean) ─────────────────────────────────────
expect clean t3-py-script   "python3 scripts/build.py"
expect clean t3-node-app    "node dist/app.js"
expect clean t3-ruby-file   "ruby app.rb"
expect clean t3-node-vers   "node --version"
expect clean t3-py-vers     "python3 --version"
expect clean t3-perl-file   "perl script.pl"
expect clean t3-perl-v      "perl -v"
expect clean t3-nodemon     "nodemon -e ts,js,json"           # watch-extensions, not eval
expect clean t3-node-instr  "echo 'use node -e or python3 -c here'"
expect clean t3-exempt-noop "python3 build.py # native-tool-exempt"  # hatch ignored when unflagged

# ── Tier 3: JS/TS-runner wrappers ARE steered (v5.3 — t3norm strips the wrapper) ──
expect deny w-pnpm-exec   "pnpm exec node -e 'x'"
expect deny w-npx-tsx     "npx tsx -e 'x'"
expect deny w-pnpm-dlx    "pnpm dlx ts-node -e 'x'"
expect deny w-pnpm-py     "pnpm exec python3 -c 'x'"
expect deny w-bunx-tsx    "bunx tsx -e 'x'"
expect deny w-tsx-bare    "tsx -e 'x'"
expect deny w-tsnode-bare "ts-node -e 'x'"
expect deny w-env-wrap    "NO_COLOR=1 pnpm exec node -e 'x'"
expect ask  w-wrap-exempt "pnpm exec node -e 'x' # native-tool-exempt"
# ── Wrapper steering applies at EACH statement head, not just command start ──
expect deny  w-sep-semi  "echo hi; pnpm exec node -e 'x'"
expect deny  w-sep-and   "git status && npx tsx -e 'x'"
expect deny  w-sep-or    "false || pnpm exec node -e 'x'"
expect deny  w-sep-subst "echo \"\$(pnpm dlx ts-node -e 'x')\""
expect clean w-sep-neg   "echo hi; pnpm exec jest --runInBand"
# ── Wrapped NON-interpreters must stay clean (matcher exposes the inner token) ──
expect clean w-neg-jest   "pnpm exec jest --runInBand"
expect clean w-neg-tsc    "pnpm exec tsc --noEmit"
expect clean w-neg-eslint "pnpm exec eslint --quiet src"
expect clean w-neg-prisma "pnpm exec prisma generate"
expect clean w-neg-next   "pnpm exec next build"
expect clean w-neg-tsxfile "npx tsx script.ts"
expect clean w-neg-nodefile "pnpm exec node app.js"
# ── Wrapper after a pipe is stripped too (anchored on ^|pipe) ──
expect deny  w-pipe-wrap  "git log --oneline | pnpm exec node -e 'x'"
expect deny  w-pipe-npx   "git log | npx tsx -e 'x'"
# ── Whitespace-robust wrapper strip (multiple spaces / tabs) ──
expect deny  w-ws-spaces  "pnpm  exec node -e 'x'"
expect deny  w-ws-tab     "$(printf 'pnpm exec\tnode -e x')"
# ── Remaining documented edge: wrapper carrying its own flag still slips ──
expect clean w-gap-npxflag "npx -y tsx -e 'x'"

# ── §20 reshape matrix: deny + the CORRECT tool is named (representative + gotchas) ──
expect_reason "Read tool"  r-read-cat       "cat src/index.ts"
expect_reason "Read tool"  r-read-sedrange  "sed -n '5,10p' f.ts"
expect_reason "rg"         r-rg-include     "grep --include='*.ts' -rn foo src"
expect_reason "rg"         r-rg-gotcha-h    "grep -h foo f.ts"
expect_reason "rg"         r-rg-bigL        "grep -rL foo src"
expect_reason "rg"         r-rg-sedsearch   "sed -n '/foo/p' f.ts"
expect_reason "fd"         r-fd-name        "find . -name '*.ts'"
expect_reason "fd"         r-fd-mtime       "find . -mtime -1"
expect_reason "fd"         r-fd-delete      "find . -name '*.tmp' -delete"
expect_reason "Edit/Write" r-edit-global    "sed -i 's/a/b/g' f.ts"
expect_reason "Edit/Write" r-edit-perl      "perl -pi -e 's/a/b/g' f.ts"
expect_reason "jq"         r-interp-json    "python3 -c \"import json,sys;print(json.load(sys.stdin)['v'])\""
expect deny r-gi-next   "grep -rn foo .next"
expect deny r-gi-github "grep -rn TODO .github"
expect deny r-gi-logs   "find . -name '*.log'"

# ── Coverage completeness (audit additions) ─────────────────────────────────
# All Tier-3 wrappers in the strip (npm exec / yarn dlx / yarn exec were untested)
expect deny  cov-npm-exec   "npm exec node -e 'x'"
expect deny  cov-yarn-dlx   "yarn dlx tsx -e 'x'"
expect deny  cov-yarn-exec  "yarn exec node -e 'x'"
expect deny  cov-wrap-chain "pnpm exec npx tsx -e 'x'"           # chained wrappers
# Cross-feature: interpreter / in-place edit INSIDE process substitution
expect deny  cov-ps-node    "diff <(node -e 'console.log(1)') x" # Tier 3 inside <()
expect deny  cov-ps-py      "foo <(python3 -c 'print(1)')"
expect deny  cov-ps-sedi    "foo <(sed -i 's/a/b/' f)"           # Tier 1 inside <()
# Tier-1 multi-expression / -e forms
expect deny  cov-sedi-e     "sed -i -e 's/a/b/' f"
expect deny  cov-sedi-bsd-e "sed -i '' -e 's/a/b/' f"
expect deny  cov-perli-e    "perl -i -e 's/a/b/;s/c/d/' f"
# Tier-2 here-string suppressed (stdin, not a file) vs quoted conflict-marker search
expect clean cov-herestring "cat <<< 'hello'"
expect deny  cov-conflict   "grep -rn '<<<<<<<' ."               # quoted '<<' still steers to rg
# Package-manager run/install must never trip the wrapper strip
expect clean cov-npm-run    "npm run build"
expect clean cov-yarn-inst  "yarn install"

# ── Summary ─────────────────────────────────────────────────────────────────
echo
echo "PASS: $pass   FAIL: $fail   TOTAL: $((pass + fail))"
if [ "$fail" -gt 0 ]; then
  printf '%s\n' "FAILURES:"
  printf '  %s\n' "${failed_cases[@]}"
  exit 1
fi
echo "All golden tests passed."
exit 0
