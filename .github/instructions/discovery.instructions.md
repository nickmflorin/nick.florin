---
applyTo: '**'
description: 'Discovery and context loading policy for AI agents'
---

<!-- Parity: keep in sync with .claude/rules/discovery.md -->

# Discovery & Context Loading Policy

Delegate code searches and documentation reads to Haiku subagents instead of running them directly
in the main conversation. The main model stays focused on reasoning, architecture, and code
generation.

## Decision Tree

### Code Discovery

| Situation                                                                | Action                                     |
| ------------------------------------------------------------------------ | ------------------------------------------ |
| File location is in the [codebase index](codebase-index.instructions.md) | Go directly to the file (no search needed) |
| Need 1 quick Grep/Glob                                                   | Run it directly                            |
| Need 2+ searches to find what you need                                   | Launch a Haiku Explore subagent            |
| Open-ended exploration ("how does X work?")                              | Launch a Haiku Explore subagent            |

### Documentation & Context Loading

| Situation                                                     | Action                                       |
| ------------------------------------------------------------- | -------------------------------------------- |
| Need to read 1 short file (<100 lines) you will directly edit | Read it directly                             |
| Need to read 2+ docs for context before implementing          | Launch a Haiku Explore subagent              |
| Project doc reads (CLAUDE.md, `.claude/rules/`, `docs/`)      | Launch a Haiku Explore subagent              |
| Reading docs to understand patterns/conventions               | Launch a Haiku Explore subagent              |
| Reading a file you are about to edit                          | Read it directly (you need the full content) |

## How

### Code Discovery

```
Agent(subagent_type="Explore", model="haiku", prompt="Find where the admin skills table derives its filter state from URL search params, and which hooks/components are involved")
```

### Documentation Context Loading

```
Agent(subagent_type="Explore", model="haiku", prompt="Read these docs and extract all rules, patterns, code examples, and anti-patterns I need to follow: docs/projects/resume-generation/README.md, docs/projects/resume-generation/status.md. Return rules and code examples verbatim, not paraphrased.")
```

Key prompting rules for doc reads:

- Tell Haiku to return rules and code examples **verbatim**, not summarized
- Be specific about what you need: "auth patterns", "test conventions", "placement rules"
- List the exact file paths to read

## Why

Code discovery and documentation reads are **information retrieval**, not reasoning. Haiku handles
Grep/Glob/Read identically to Opus/Sonnet but at a fraction of the token cost. Raw doc content
inflates the main conversation context and compounds cost on every subsequent turn.

| Approach                            | Context cost (main model)                 |
| ----------------------------------- | ----------------------------------------- |
| Read 4 docs directly                | ~10,000 tokens (stays in context forever) |
| Haiku reads 4 docs, returns summary | ~800-1,500 tokens (focused extraction)    |

## What Stays on the Main Model

| Task                                 | Why                                           |
| ------------------------------------ | --------------------------------------------- |
| Reading a file you are about to edit | Need full content for accurate edits          |
| Writing code                         | Requires reasoning and architecture knowledge |
| Architectural decisions              | Requires judgment and tradeoff analysis       |
| Reviewing code for correctness       | Requires deep understanding                   |

## Anti-Patterns

| Pattern                                                     | Problem                                                 | Fix                                           |
| ----------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------- |
| Running 3+ Grep calls directly in main conversation         | Inflates context with tool results at Opus/Sonnet rates | Delegate to Haiku subagent                    |
| Grepping for something listed in the codebase index         | Wastes tokens on a search with a known answer           | Check the index first                         |
| Using Haiku subagent for 1 simple Grep or 1 short file read | Subagent overhead exceeds the cost                      | Just run it directly                          |
| Reading 3+ CLAUDE.md/doc files directly before implementing | Loads thousands of tokens of raw docs into context      | Haiku reads and extracts relevant rules       |
| Haiku summarizing code examples from docs                   | Main model gets paraphrased patterns, may deviate       | Prompt Haiku to return code examples verbatim |
