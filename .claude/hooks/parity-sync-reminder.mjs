#!/usr/bin/env node
/**
 * PostToolUse hook: when a rule file, Copilot instruction file, or a README that a rule points to
 * is edited, remind Claude of the other members of that file's sync group so they stay consistent.
 *
 * Self-maintaining: sync groups are discovered from conventions already in the rule files, with no
 * hard-coded mapping to keep up to date:
 * 1. The `<!-- Parity: keep in sync with <path> -->` comment links a .claude rule to its .github
 *    instruction counterpart (and vice versa).
 * 2. A markdown link whose target ends in `README.md` links a rule to its source-of-truth README.
 *
 * Editing a rule/instruction reports its parity counterpart and any README it links. Editing a
 * README reports every rule/instruction that links back to it. The hook only reminds; the README
 * stays the source of truth and content reconciliation is a judgment call left to Claude.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, resolve, relative, join, basename } from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

const raw = readStdin();
if (!raw.trim()) process.exit(0);

let payload;
try {
  payload = JSON.parse(raw);
} catch {
  process.exit(0);
}

const editedPath = payload?.tool_response?.filePath ?? payload?.tool_input?.file_path;
if (!editedPath) process.exit(0);

const editedAbs = resolve(root, editedPath);
const editedRel = relative(root, editedAbs);

const isReadme = basename(editedAbs) === 'README.md';
/* A README.md inside the rules/instructions dirs is an index, never a parity rule, so it is
   classified as a README (handled by the linked-by branch) rather than as a rule file. */
const isRule = !isReadme && editedRel.startsWith('.claude/rules/') && editedRel.endsWith('.md');
const isInstruction =
  !isReadme && editedRel.startsWith('.github/instructions/') && editedRel.endsWith('.md');

if (!isRule && !isInstruction && !isReadme) process.exit(0);

const ReadmeLinkPattern = /\]\(([^)]*README\.md)\)/g;
const ParityPattern = /Parity:\s*keep in sync with\s+(\S+\.md)/i;

const group = new Set();

function readSafe(absPath) {
  return existsSync(absPath) ? readFileSync(absPath, 'utf8') : null;
}

function collectFromRuleFile(absPath) {
  const text = readSafe(absPath);
  if (text === null) return;
  const parity = text.match(ParityPattern);
  if (parity) group.add(parity[1]);
  const fileDir = dirname(absPath);
  for (const match of text.matchAll(ReadmeLinkPattern)) {
    group.add(relative(root, resolve(fileDir, match[1])));
  }
}

function ruleFilesLinkingTo(targetRel) {
  const found = [];
  const stack = [join(root, '.claude/rules'), join(root, '.github/instructions')];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const entryPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
        continue;
      }
      if (!entry.name.endsWith('.md')) continue;
      const text = readSafe(entryPath);
      if (text === null) continue;
      for (const match of text.matchAll(ReadmeLinkPattern)) {
        if (relative(root, resolve(dirname(entryPath), match[1])) === targetRel) {
          found.push(relative(root, entryPath));
          break;
        }
      }
    }
  }
  return found;
}

if (isRule || isInstruction) {
  collectFromRuleFile(editedAbs);
} else {
  for (const ruleFile of ruleFilesLinkingTo(editedRel)) group.add(ruleFile);
}

group.delete(editedRel);
if (group.size === 0) process.exit(0);

const counterparts = [...group].map(path => `  - ${path}`).join('\n');
const additionalContext =
  `You edited ${editedRel}, which belongs to a documented sync group. If this change altered ` +
  `any normative rule, update its counterparts so they stay consistent:\n${counterparts}\n` +
  `The README is the source of truth; the .claude rule and .github instruction are near-verbatim ` +
  `parity copies of each other (the /sync-ai-config skill can reconcile that pair). Skip this if ` +
  `your edit was purely cosmetic.`;

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext },
  }),
);
