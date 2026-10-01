# The CLI

The repository's tooling is being consolidated into a single command-line application, invoked
through one script:

```bash
pnpm cli <command>
```

It is built in parallel with the existing per-task scripts, which all still work. Commands are
ported across one at a time; [scripts.md](./scripts.md) is the inventory of every script and where
each one stands. The working notes for the migration live in
[projects/cli-hardening/](../projects/cli-hardening/README.md).

## Getting Around

Every command documents itself. Nothing below has to be memorized:

```bash
pnpm cli --help                     # every command, grouped by category
pnpm cli content sync --help        # one command's flags, details and examples
```

`pnpm cli` loads the development environment first (through `env:setup:dev`), so the database and
Clerk credentials are in place before a command runs.

## Available Commands

| Command        | What it does                                                     |
| -------------- | ---------------------------------------------------------------- |
| `content sync` | Moves resume content between the YAML fixtures and the database. |

### `content sync`

Plans the change set, renders it in full, and asks before writing anything. Both directions are the
same operation with the two content stores swapped.

```bash
pnpm cli content sync                                    # asks which direction
pnpm cli content sync --direction=push                   # fixtures → database
pnpm cli content sync --direction=pull                   # database → fixtures
pnpm cli content sync --direction=push --dry-run         # plan and render, write nothing
pnpm cli content sync --direction=push --yes             # skip the confirmation
pnpm cli content sync --direction=pull --entity=role --entity=course
```

| Flag          | Default      | Notes                                                            |
| ------------- | ------------ | ---------------------------------------------------------------- |
| `--direction` | _asked for_  | `push` or `pull`. Prompted when omitted rather than defaulted.   |
| `--entity`    | every entity | Repeatable. Restricts the run to the named entities.             |
| `--dry-run`   | `false`      | Plans and renders, then stops. `--no-dry-run` also accepted.     |
| `--yes`       | `false`      | Skips the confirmation. Required when the terminal is not a TTY. |

A push applies inside one transaction, so it commits or rolls back as a unit. A pull rewrites
fixture files, which should then be formatted:

```bash
pnpm resume:fixtures:format
```

**`--entity` does not currently work for entities that reference others.** Scoping to `role` alone
fails validation with hundreds of unresolved-reference errors, because references are resolved
across the whole loaded set. This predates the CLI — the original `content:push` behaves the same
way — and is tracked in
[projects/cli-hardening/open-questions.md](../projects/cli-hardening/open-questions.md).

## How It Is Built

| Concern    | Choice                                                                           |
| ---------- | -------------------------------------------------------------------------------- |
| Commands   | [clipanion](https://github.com/arcanis/clipanion) — class-based and type-safe    |
| Prompts    | [@clack/prompts](https://bomb.sh/docs/clack/) — input, spinners, progress, boxes |
| Color      | Node's built-in `node:util` `styleText` — no dependency                          |
| Tables     | `console-table-printer`                                                          |
| Validation | Zod, through one adapter at Clipanion's validator boundary                       |

The code lives in `src/scripts/cli-v2/`:

```text
src/scripts/cli-v2/
├── cli.ts                     # the command registry
├── run.ts                     # entry point
├── args/zod-validator.ts      # Zod → Clipanion validator adapter
├── commands/
│   ├── base-command.ts        # framing, error → exit code, teardown
│   ├── context-command.ts     # Clerk identity + database lifecycle
│   └── content-sync-command.ts
├── context/                   # Clerk identity resolution
├── output/                    # the terminal surface
└── sync/render.ts             # the content diff renderer
```

### Registering a Command

Commands are listed in one place rather than discovered from the filesystem, so the set of them is
knowable by reading a single file and adding one is a compile-time change:

```typescript
const Commands: readonly CommandClass[] = [ContentSyncCommand];
```

### Arguments Are Described in Zod

Clipanion types its `validator` slot as a typanion validator, so a single adapter converts at that
boundary. Every command describes its arguments in Zod, which keeps one schema language in the
repository and lets an argument schema compose with the domain schemas:

```typescript
public direction = Option.String('--direction', {
  description: 'Which way content moves.',
  validator: zodValidator(z.enum(['pull', 'push'])),
});
```

Zod's own messages surface through Clipanion's usage errors, and a transforming schema is honored —
`z.coerce.number()` means the command receives a number rather than a string.

### Exit Codes

| Code | Meaning                                                   |
| ---- | --------------------------------------------------------- |
| `0`  | Success.                                                  |
| `1`  | Failure.                                                  |
| `2`  | Aborted — a declined confirmation, or a cancelled prompt. |

An abort is separated from a failure because a declined confirmation is the tool working correctly.

### Prompts Never Hang

Every prompt is answerable from the command line, and refuses rather than blocks when the terminal
is not interactive:

```text
The terminal is not interactive, so 'Apply this push?' cannot be asked. Pass --yes to answer it
up front.
```

A command that can run unattended therefore does not stop being one merely because it grew a
question.

## Conventions

- **Nothing below `src/scripts/` writes to the terminal.** The domain layers return data; the CLI
  decides how it reads. Presentation that used to live in `src/database/content/` — the sync diff
  renderer — now lives under `cli-v2/`.
- **Import concrete modules, not the `~/database/content` barrel.** The barrel reaches the bindings,
  and through them the Prisma client, the logger, and the environment configuration. A module that
  only formats strings would otherwise refuse to load without a fully populated environment.
- **Color is never applied directly.** Call sites name a semantic role (`added`, `removed`,
  `changed`, `muted`) and `output/styles.ts` owns the palette. `styleText` drops the escape codes
  when the stream is not a TTY, so piping to a file yields plain text.
