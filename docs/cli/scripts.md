# Script Inventory

Every task script in the repository, what it does, how to run it, and whether it has been absorbed
into [the CLI](./index.md) yet.

The CLI is being built in parallel: **every script below still works unchanged**, and each is ported
across one at a time. `jsonify` is the one script that will not be ported.

| Script                   | Status       | CLI command       |
| ------------------------ | ------------ | ----------------- |
| `sync-content/`          | **Ported**   | `content sync`    |
| `generate-resume/`       | **Ported**   | `resume generate` |
| `emit-resume-fixtures`   | Not yet      | —                 |
| `seed/`                  | Not yet      | —                 |
| `sync-repositories`      | Not yet      | —                 |
| `calculate-experience`   | Not yet      | —                 |
| `update-company-logo`    | Not yet      | —                 |
| `transcode-project-gifs` | Not yet      | —                 |
| `jsonify/`               | **Excluded** | never             |

## Content

### `sync-content` — ported

Moves resume content between the YAML fixtures and the database. See
[the CLI reference](./index.md#content-sync) for the ported form.

```bash
pnpm content:push          # fixtures → database (legacy entry point)
pnpm content:pull          # database → fixtures (legacy entry point)
pnpm cli content sync      # the CLI equivalent
```

The legacy entry points take `--direction`, `--entity=a,b` (comma-separated), `--dry-run=true` and
`--yes=true`. Note the `=value` is mandatory on the booleans there, and that omitting `--direction`
silently defaults to `push` — both of which the CLI form changes.

## Resume Documents

### `generate-resume`

Renders the resume to static HTML, prints it to PDF through headless Chrome, and inlines everything
into a single distributable file. Output lands in `build/documents/resume/`.

```bash
pnpm cli resume generate                         # all three steps (also `pnpm resume:generate`)
pnpm resume:generate:html                        # --step html
pnpm resume:generate:pdf                         # --step pdf
pnpm resume:generate:artifact                    # --step artifact
pnpm cli resume generate --step html --step pdf  # any subset, always run in pipeline order
```

Steps always execute in `html → pdf → artifact` order regardless of the order given. The PDF step
needs a Chrome-family binary; set `CHROME_PATH` if it is not found automatically. Needs no database
and no environment setup.

### `emit-resume-fixtures`

Emits the YAML fixtures in `src/documents/resume/fixtures/` from the TypeScript data modules in
`src/documents/resume/data/`. Takes no arguments, needs no database.

```bash
pnpm resume:fixtures         # emits, then formats
pnpm resume:fixtures:format  # formats the emitted YAML only
```

## Database

### `seed`

Seeds the database from the JSON fixtures, in one transaction, in a strict dependency order. Takes
no arguments. Invoked through Prisma's `seed` hook, so it also runs as part of a migration reset.

```bash
pnpm prisma:seed        # development
pnpm prisma:seed:prod   # production
```

### `calculate-experience`

Recomputes `calculatedExperience` on every skill and updates the rows that drifted. Throws if a
computed value disagrees with a manually overridden one. Takes no arguments.

```bash
pnpm experience:calculate
```

**Development only.** The `:prod` variant exists but the script refuses to run outside development.

### `sync-repositories`

Pulls repositories from the GitHub API into the `Repository` model. Takes no arguments.

```bash
pnpm repositories:sync
pnpm repositories:sync:prod
```

### `update-company-logo`

Repoints a company's `logoImageUrl` at a different file under `public/`. Reports the current and new
values, and **writes nothing unless `--commit` is passed**.

```bash
pnpm company:logo --name='Craft Education System' --logo=/experience/craft.svg
pnpm company:logo --name='Craft Education System' --logo=/experience/craft.svg --commit
```

Both `--name` (an exact company name) and `--logo` (a root-relative path starting with `/`) are
required.

## Media

### `transcode-project-gifs`

Transcodes the GIFs under `media/project-recordings/` into H.264 `.mp4` and VP9 `.webm` under
`public/projects/`, mirroring the subdirectory structure. Needs no database.

```bash
pnpm projects:transcode-gifs
pnpm projects:transcode-gifs --dry-run          # report without writing
pnpm projects:transcode-gifs --only=greenbudget # restrict by path substring
```

## Excluded

### `jsonify`

Writes the legacy JSON fixtures from the production database. It belongs to the pre-`Competency`
data model and **is not being ported** to the CLI.

```bash
pnpm fixtures:jsonify:prod
```

## Conventions in the Legacy Scripts

Worth knowing, because the CLI deliberately diverges from all of them:

- **Three different dry-run spellings.** `transcode-project-gifs` accepts `--dry-run` bare or
  `--dry-run=false`; `sync-content` requires `--dry-run=true`; `update-company-logo` inverts the
  idea entirely with a bare `--commit`.
- **Named arguments require `=value`.** A bare `--name` throws rather than being read as a switch.
- **Argument matching is a prefix match**, so a lookup for `--dry` would also match `--dry-run`.
- **No `--help` anywhere**, and no validation of unrecognized flags.
- **Two scripts bypass the script lifecycle entirely** — `transcode-project-gifs` and
  `emit-resume-fixtures` need neither a database nor Clerk, and do not run through `runScript`.
  (`generate-resume` was a third, until it moved to `pnpm cli resume generate`.)
