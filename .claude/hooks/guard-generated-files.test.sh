#!/usr/bin/env bash
# Golden-input regression tests for the guard-generated-files PreToolUse hook.
#
# Each case asserts the hook's DECISION (deny | clean) for a tool payload. The hook only inspects
# the payload — nothing is executed — so these are pure and fast.
#
# Run:  bash .claude/hooks/guard-generated-files.test.sh
# Exit: 0 = all pass, 1 = one or more failures (suitable as a pre-commit / CI gate).

set -u
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK="$HOOK_DIR/guard-generated-files.sh"
pass=0
fail=0
failed_cases=()

decide_edit() {
  jq -n --arg tool "$1" --arg path "$2" '{tool_name: $tool, tool_input: {file_path: $path}}' |
    bash "$HOOK" | jq -r '.hookSpecificOutput.permissionDecision // "clean"' 2>/dev/null ||
    printf 'clean'
}

decide_bash() {
  jq -n --arg cmd "$1" '{tool_name: "Bash", tool_input: {command: $cmd}}' |
    bash "$HOOK" | jq -r '.hookSpecificOutput.permissionDecision // "clean"' 2>/dev/null ||
    printf 'clean'
}

check() {
  local name="$1" expected="$2" actual="$3"
  actual="${actual:-clean}"
  if [ "$actual" = "$expected" ]; then
    pass=$((pass + 1))
  else
    fail=$((fail + 1))
    failed_cases+=("$name: expected $expected, got $actual")
  fi
}

# --- Edit / Write path guard ---------------------------------------------------------------------
check "edit migration file" deny \
  "$(decide_edit Edit 'src/database/prisma/migrations/20240101_init/migration.sql')"
check "write into generated client" deny \
  "$(decide_edit Write 'src/database/model/generated/index.ts')"
check "edit prisma schema (allowed)" clean \
  "$(decide_edit Edit 'src/database/prisma/schema.prisma')"
check "edit model wrapper (allowed)" clean \
  "$(decide_edit Edit 'src/database/model/skill.ts')"

# --- Bash mutation guard -------------------------------------------------------------------------
check "rm migration folder" deny \
  "$(decide_bash 'rm -rf src/database/prisma/migrations/20240101_init')"
check "git rm generated client" deny \
  "$(decide_bash 'git rm src/database/model/generated/index.ts')"
check "redirect into migrations" deny \
  "$(decide_bash 'echo notes > src/database/prisma/migrations/notes.md')"
check "sed -i on migration" deny \
  "$(decide_bash "sed -i '' 's/a/b/' src/database/prisma/migrations/20240101_init/migration.sql")"
check "cd into migrations then rm" deny \
  "$(decide_bash 'cd src/database/prisma/migrations && rm -rf 20240101_init')"

# --- Reads and unrelated commands stay allowed ---------------------------------------------------
check "cat migration (read-only)" clean \
  "$(decide_bash 'cat src/database/prisma/migrations/20240101_init/migration.sql')"
check "ls generated client" clean \
  "$(decide_bash 'ls src/database/model/generated')"
check "cd into migrations then ls" clean \
  "$(decide_bash 'cd src/database/prisma/migrations && ls')"
check "prisma migrate dev (no protected path in command)" clean \
  "$(decide_bash 'pnpm exec prisma migrate dev --name add-field')"
check "rm elsewhere while reading migration" clean \
  "$(decide_bash 'rm /tmp/scratch.txt; cat src/database/prisma/migrations/20240101_init/migration.sql')"

# --- Bypass semantics ----------------------------------------------------------------------------
check "inline bypass prefix" clean \
  "$(decide_bash 'ALLOW_GENERATED_FILE_MUTATION=1 rm -rf src/database/prisma/migrations/20240101_init')"
check "bypass token after destructive segment does not neutralize" deny \
  "$(decide_bash 'rm -rf src/database/prisma/migrations/20240101_init; ALLOW_GENERATED_FILE_MUTATION=1 echo ok')"

echo "pass: $pass  fail: $fail"
if [ "$fail" -gt 0 ]; then
  printf '%s\n' "${failed_cases[@]}"
  exit 1
fi
exit 0
