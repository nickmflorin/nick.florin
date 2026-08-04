# nick.florin

This repository contains a web application that supports my personal resume, portfolio and website.

&copy; Nick Florin, 2024

## System Requirements

The contents of this document assume that you are using a MacOS machine. If you are not, steps
outlined for setting up and running the application locally will be similar, but not exactly the
same.

- [nvm]: A [node] version manager.
- [Node][node] v22.x (pinned to v22.22.0 by the `.nvmrc` file)
- [homebrew]: A MacOSX package manager.
- [postgresql] (a [homebrew] package)
- [pnpm]: A [node] package manager (pinned to v9.15.9 by the `packageManager` field).
- [Vercel CLI][vercel-cli]: [Vercel][vercel]'s command line utility.

Both the [node] and [`pnpm`][pnpm] versions are pinned by the repository, and both pins are
enforced: the `engines` field combined with `engineStrict` rejects an incorrect [node] version, and
the `packageManager` field instructs [corepack] to select the correct [`pnpm`][pnpm] version. Do not
work around either pin - see Section 1.2 for how to satisfy them.

## 1. Getting Started

This section of the documentation outlines - at a high level - how to setup your machine for local
development for the first time. For more detailed explanations related to local development or
production deployments, see the Section 2: Development.

**Note**: _This documentation describes how to setup and configure the application for local
development on MacOSX. Many of the steps outlined in this section may also be applicable for a
Windows/Ubuntu machine as well, but the steps will not be exactly as they are described here._

### 1.1: Repository

Clone this repository locally and `cd` into the directory.

```bash
$ git clone git@github.com:nickmflorin/nick.florin.git
```

### 1.2: Installing System Requirements

This section walks through how to install and configure the prerequisites (System Requirements) for
this project.

#### 1.2.a [Node][node]

[Node][node] is the engine that supports the application. This project uses [node] v22.22.0. Your
machine will most likely already have a system installation of [node], but even if it does not -
that is okay, we will not be using the system installation of [node] but will rather isolate the
version of [node] being used for this project to this repository using [nvm].

The required version is declared in two places, and they must agree: the `.nvmrc` file pins the
exact version [nvm] installs, and the `engines` field of the `package.json` file declares the range
(`>=22`) that the application will accept. Because the `.npmrc` file sets `engine-strict=true`,
[`pnpm`][pnpm] refuses to install against a [node] version outside that range rather than warning
and continuing.

**Important**: _Do not use a system installation of [node]. It will complicate your development
environment. Instead, see the next section for details about usage of [nvm]._

##### 1.2.a.i Installing [nvm]

It is strongly recommended that you use [nvm] to manage the version(s) of [node] that are being used
for this project, rather than system installations. It will allow you to more easily isolate the
version of [node] being used for this project to the project directory, avoiding conflicts with
global or system installations of [node].

Instructions for installing [nvm] can be found
[here](https://github.com/nvm-sh/nvm#installing-and-updating), but are also mentioned below for
purposes of completeness:

First, simply run the install script:

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

The above command will download a script and then run it. The script it runs will first clone the
[nvm] repository at `~/.nvm` and then attempt to add the following source lines to your machine's
shell profile script (which may be either `~/.bash_profile`, `~/.zshrc`, `~/.profile`, or
`~/.bashrc` - depending on your OS):

```bash
$ export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

**Note**: _This installation will automatically make changes to your shell profile script. The exact
file will depend on the type of machine you are running as well as the period of time in which the
machine was created. Most likely, your shell profile script will be `~/.zshrc` - which is the shell
profile used for Mac's created since the introduction of the M1 processor._

Since the [nvm] installation involved making changes to your shell profile script behind the scenes,
in order for those changes to take effect, you need to subsequently source your shell profile script
(`~/.zshrc` in this example):

```bash
$ . ~/.zshrc`
```

Finally, verify that your system recognizes the `nvm` command by running the following:

```bash
$ nvm
```

##### 1.2.a.ii Node Version

Now that [nvm] is installed, we need to use it to establish the correct version of [node], 22, that
is suitable for this project. This project's repository comes equipped with a `.nvmrc` file that
automatically tells [nvm] what version of [node] to use - but that version may still need to be
installed.

First, instruct [nvm] to use the [node] version specified by the `.nvmrc` file with the following
command:

```bash
$ nvm use
```

If you see an output similar to the following:

```bash
Found '/<path-to-repository>/nick.florin/.nvmrc' with version <v22.22.0>
Now using node v22.22.0 (npm v10.9.4)
```

It means that the correct version of [node] that is required for this project is already installed
with [nvm] and that version of [node] is active for this project's directory. The rest of this step
can be skipped and you can proceed to the next step, "1.2.b: Homebrew".

On the other hand, if you see an error similar to the following:

```bash
Found '/<path-to-repository>/nick.florin/.nvmrc' with version <v22.22.0>
N/A: version "v22.22.0 -> N/A" is not yet installed.

You need to run "nvm install v22.22.0" to install it before using it.
```

It means that the correct version of [node] that is required for this project is not already
installed with [nvm], and must be installed before using it. To do this, simply run the following
command from the root of the project repository:

```bash
$ nvm install
```

This command will use [nvm] to install the correct version of [node] that is required for this
project, based on the specification in the project's `.nvmrc` file.

Finally, all that is left to do is to instruct [nvm] to use this version of [node] by executing the
following command - again, from the root of the project repository:

```bash
$ nvm use
```

For a sanity check, confirm that [nvm] is pointing to the correct version of [node] in the project
directory by executing the following command:

```bash
$ nvm current
```

The output of this command should be similar to the following:

```bash
$ v22.x.x
```

At this point, if [nvm] is not pointing at the correct version of [node] or is pointing at a system
installation of [node], something went awry - consult a team member before proceeding.

**Important**: _[nvm] only applies the version for the current shell session. A new terminal will
revert to your default [node] version, so `nvm use` must be run whenever you return to the project
directory. If a command fails with a syntax error, an `engine-strict` rejection, or the
`enforce-node-version` script reporting an unsatisfied version, `nvm use` is almost always the fix._

#### 1.2.b: Homebrew

If on MacOSX, you will need to install [homebrew], which is a MacOSX package manager.

#### 1.2.c: pnpm

This application uses [`pnpm`][pnpm] to manage dependencies. The exact version is pinned by the
`packageManager` field of the `package.json` file, and that pin is the single source of truth:

```json
"packageManager": "pnpm@9.15.9"
```

The pin is not cosmetic. The `pnpm-lock.yaml` file is written in `lockfileVersion` 9.0, which only
[`pnpm`][pnpm] v9 and above can read. Installing with an older [`pnpm`][pnpm] does not fail loudly -
it silently discards the committed lockfile and resolves the entire dependency tree from scratch,
producing a different set of installed versions than the ones the application is tested and deployed
with. See Section 1.5.b for how to recognize this.

##### 1.2.c.i Installing [`pnpm`][pnpm] via [corepack]

[corepack] ships with [node], reads the `packageManager` field, and downloads and runs the pinned
version automatically. It is the only installation method that keeps your [`pnpm`][pnpm] version in
step with the repository, so install [`pnpm`][pnpm] this way rather than through a standalone
installer or [homebrew].

Because [nvm] is being used, [corepack] comes from the active [node] installation - so run `nvm use`
first, then enable it:

```bash
$ nvm use
$ corepack enable pnpm
```

Then confirm that the `pnpm` command resolves to the pinned version. Run this from the root of the
project repository, since [corepack] reads the version out of the nearest `package.json` file:

```bash
$ pnpm -v
9.15.9
```

##### 1.2.c.ii Conflicts With an Existing [`pnpm`][pnpm] Installation

`corepack enable` installs its shim into the active [node] installation's `bin` directory. If you
previously installed [`pnpm`][pnpm] through the standalone installer at `get.pnpm.io`, that
installation lives in `$PNPM_HOME` (typically `~/Library/pnpm`), and most shell profiles prepend
`$PNPM_HOME` to the `PATH` _after_ [nvm] has been loaded. The standalone binary therefore shadows
the [corepack] shim, and `pnpm -v` continues to report the old version no matter how many times
`corepack enable` is run.

The fix is to install the shim into `$PNPM_HOME` itself, so that it occupies the entry in the `PATH`
that wins. Preserve the old binary first, in case you need to fall back to it:

```bash
$ mv "$PNPM_HOME/pnpm" "$PNPM_HOME/pnpm.bak"
$ corepack enable --install-directory "$PNPM_HOME" pnpm
```

Verify with `which pnpm` (it should resolve to a symlink into [corepack]) and `pnpm -v` (it should
report the pinned version). Once confirmed, `$PNPM_HOME/pnpm.bak` can be deleted.

##### 1.2.c.iii Changing the Pinned Version

To move the project to a different [`pnpm`][pnpm] version, edit the `packageManager` field and
commit the change. Every machine and the [Vercel][vercel] build will pick it up on the next install;
no developer needs to run an installation command. Do not use `corepack prepare --activate` to set a
version locally, as it puts your machine out of step with the repository - the very problem the pin
exists to prevent.

#### 1.2.d: Vercel CLI

Once [`pnpm`][pnpm] is installed, [Vercel]'s [CLI][vercel-cli] needs to be installed. This
application uses [Vercel]'s [CLI][vercel-cli] to manage environment variables in both production and
development environments, particularly environment variables that represent sensitive information.

To install [Vercel]'s [CLI][vercel-cli], simply use [`pnpm`][pnpm] to install the package globally:

```bash
$ pnpm i -g vercel
```

**Important**: _The `-g` flag is required. Without it, [`pnpm`][pnpm] installs the [CLI][vercel-cli]
as a project dependency, adding a `vercel` entry to the `package.json` file and several thousand
lines to the `pnpm-lock.yaml` file. The [CLI][vercel-cli] is a developer tool, not something the
application imports, so it must never appear in the `package.json` file. If it does, remove it with
`pnpm remove vercel` and reinstall it globally._

If you notice an error similar to the following:

```
Error: Cannot find module 'stream/web'
```

It means that you are not using the correct version of [node] (v22.x.x). Simply execute `nvm use` to
ensure your [node] version is correct, and then try to run the installation command again.

Once the [CLI][vercel-cli] is installed, you must login with your [Vercel][vercel] credentials:

```bash
$ vercel login
```

### 1.3: Environment

This section discusses how to properly setup environment variables and dependencies in the
application.

#### 1.3.a ENV File

When running the application locally, there will likely be additional, sensitive keys that needed to
be added to the environment via environment variables. These keys **cannot** be committed to source
control, and precaution must be taken to avoid doing so.

The files that this application uses to define environment variables that represent sensitive
information are as follows:

1. `.env.local`
2. `.env.development.local`
3. `.env`

Each of these files are ignored by the `.gitignore` file and will not be committed to source
control. The `.env` file will be loaded first, followed by the `.env.development.local` file and
then finally, the `.env.local` file (in a "development" environment). The `.env.local` and
`.env.development.local` files can be created on an individual developer basis, for purposes of
overridding certain configurations when developing. On the other hand, the `.env` file is used for
storing sensitive information directly from [Vercel][vercel]'s infrastructure.

**Note:** _Sensitive keys, tokens or keys related to access control should **only** ever be added to
`.env.local`, `.env.development.local` or `.env`. Other environment files (`.env.development`,
`.env.production`, .etc) are committed to source control, and should **never** contain sensitive
information._

_For more information regarding environment variables in [NextJS][nextjs], and the order in which
they are loaded (and overridden) please refer to Section 2.5._

To populate your local environment with the required environment variables necessary to run the
application locally, simply execute the following command:

```bash
pnpm env:pull
```

This command will pull the sensitive environment variables for the development environment from
[Vercel][vercel]. The environment variables will be placed inside of the `.env` file, which is the
first set of environment variables loaded by [NextJS][nextjs]. This means that any values for those
environment variables that are defined in any other environment file (`.env.local`,
`.env.development`, etc.) will override those defined in the `.env` file.

**Note:** Currently, we are using the free version of Vercel, which only supports one production
database at a time, and does not allow us to define database parameters for just the development
environment. This means that the `env:pull` command will populate the `.env` file with database
environment variables pertaining to the production database. However, these are overridden with
local, non-production values in the `.env.development` file - preventing incidental or dangerous
changes from occurring with the production database when developing locally. _For more information
related to this topic, see Section 1.4.a._

For more information regarding the environment variables, refer to Section 2.5.

#### 1.3.b: Dependencies

When setting up the environment for the first time, you must do a fresh install of the dependencies.

##### 1.3.b.i Font Awesome

The `.npmrc` file routes the `@fortawesome` and `@awesome.me` scopes to [FontAwesome][fontawesome]'s
private registry and authenticates against it with a `FONT_AWESOME_AUTH_TOKEN` environment variable,
which supports the "pro" license the application's icons are drawn from. Consult a team member for
the value of that token.

**Important**: _[`pnpm`][pnpm] expands `${FONT_AWESOME_AUTH_TOKEN}` out of the shell environment
when it reads the `.npmrc` file. It does not read the `.env` files, so defining the token in
`.env.local` or `.env.development.local` has no effect on installation - it must be exported by your
shell profile._

```bash
$ export FONT_AWESOME_AUTH_TOKEN=<token>
```

When the token is missing from the shell environment, [`pnpm`][pnpm] emits the following warning on
every install:

```
WARN  Issue while reading ".npmrc". Failed to replace env in config: ${FONT_AWESOME_AUTH_TOKEN}
```

This warning is not currently fatal. The only [FontAwesome][fontawesome] package the `package.json`
file depends on today is `@fortawesome/fontawesome-svg-core`, which resolves without
authentication - so the install completes despite the warning. It becomes a hard `401` failure the
moment a licensed package under either scope is added to the `package.json` file, so the token is
still worth exporting before you hit that.

##### 1.3.b.ii Installing

Once the token is exported, install the dependencies from the root of the project repository:

```bash
$ pnpm install
```

This will install the project dependencies in the `package.json` file, and then run the project's
`postinstall` script, which generates the [Prisma][prisma] client. See Section 2.7.a for details on
the generated client.

### 1.4: Database

This project uses a [postgres] database for both production and local development. First, check to
see if your machine already has [postgres] installed:

```bash
$ which postgres
```

If the result of the command is a directory (usually `/usr/local/bin/postgres`, if installed via
[homebrew]), then it is already installed and you can proceed to the next step. If not, simply
install [postgres] via [homebrew]:

```bash
$ brew install postgres
```

The [postgres] installation will come equipped with [psql], which is [postgres]'s command line tool.
Once [postgres] is installed, or you have verified that your machine already has a [postgres]
installation, we need to start the [postgres] server:

```bash
$ brew services start postgresql
```

#### 1.4.a Database Environment Variables

The database connection parameters for the application are defined in the relevant `.env.*` files.

The database connection parameters defined in the environment are used directly by the application's
ORM, [Prisma][prisma], to establish a connection to the application database and allow the
application to run. The following parameters must be in the environment for [Prisma][prisma] to
properly connect to the database, both in local development and in production:

```bash
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

While the `env:pull` command will populate the `.env` file environment variables used to connect to
the production database, they will always be overridden by the `.env.development` file - which is
committed to source control.

If the database environment variables defined in the `.env.development` file need to be changed
during local development, overrides should be defined in the `.env.development.local` file or the
`.env.local` file.

#### 1.4.b Setting Up Application Database

The above database connection parameters defined in the `.env.development` file (or overridden in
your `.env.local` or `.env.development.local` file) will be needed to create and setup the
application database from the [psql] shell. Since the database itself may not exit yet, we will
likely need to create it via the [psql] command line. To do this, connect to the default database
name `"postgres"`, that comes with the [homebrew] installation of [postgres]:

```bash
$ psql -d postgres
```

##### 1.4.b.i Troubleshooting

It is possible (although very unlikely) that either your [postgres] installation did not come with
the default `"postgres"` database, or it was somehow removed. If this is the case, you may see an
error similar to the following:

```bash
$ psql: error: connection to server on socket "/tmp/.s.PGSQL.5432" failed: FATAL:  database "postgres" does not exist
```

If you see this error, you cannot connect to the [psql] shell because there are no databases to
connect to. To fix this, simply run the following from the command line, and then reconnect to the
[psql] shell:

```bash
$ createdb postgres
$ psql -d postgres
```

##### 1.4.b.ii Creating the Database

Once inside of the [psql] shell, create the appropriate [postgres] database associated with this
application, based on the configuration parameters defined in the environment:

```bash
$ CREATE DATABASE <DATABASE_NAME>;
```

Then, create the [postgres] user associated with the configuration variables defined in the
environment and subsequently grant all privileges to that user:

```bash
$ CREATE USER <DATABASE_USER> WITH PASSWORD '<DATABASE_PASSWORD>';
$ GRANT ALL PRIVILEGES ON DATABASE <DATABASE_NAME> TO <DATABASE_USER>;
```

Finally, assign the created or existing user as the owner of the created or existing database.

```bash
$ ALTER DATABASE <DATABASE_NAME> OWNER TO <DATABASE_USER>;
```

##### 1.4.b.iii Assigning Permissions to Create Database

In the above section, a database with name `<DATABASE_NAME>` was created and the appropriate
permissions on that database were assigned to the database user, `<DATABASE_USER>`. However, we
still need to allow the `<DATABASE_USER>` to create new databases (versus just modifying the
existing database). This is required for [prisma] migrations to properly function.

To do this, simply give the database user, `<DATABASE_USER>`, the required permissions to create
databases so [prisma] migrations can function properly:

```bash
$ ALTER USER <DATABASE_USER> CREATEDB;
```

Now, the database user, `<DATABASE_USER>`, will be able to create databases in the [postgres]
service and [prisma] migrations will properly function.

You can now quit the [psql] shell:

```bash
$ \q
```

The application should now be ready to connect to the database for local development.

### 1.5: Troubleshooting

The failures below all stem from the local toolchain being out of step with what the repository
pins, which is the usual outcome of setting up a second machine or returning to the project after a
long absence. Each is silent or misleadingly reported, so they are collected here.

#### 1.5.a `Cannot find module 'tsconfig-paths/register'`

```
Error: Cannot find module 'tsconfig-paths/register'
Require stack:
- .../node_modules/.pnpm/ts-node@.../node_modules/ts-node/dist/util.js
```

The `ts-node` block of the `tsconfig.json` file registers `tsconfig-paths` so that scripts run
through [`ts-node`][ts-node] can resolve the `~/*` path alias. The package must therefore be present
in the `devDependencies` of the `package.json` file. If this error appears, confirm that it is, and
reinstall.

Because the `preinstall` script runs [`ts-node`][ts-node], this failure blocks `pnpm install`
itself. Break the cycle by installing once with the lifecycle scripts suppressed, then installing
normally:

```bash
$ pnpm install --ignore-scripts
$ pnpm install
```

#### 1.5.b An Install That Rewrites the Entire `pnpm-lock.yaml` File

If `git status` reports the `pnpm-lock.yaml` file as modified after an install you expected to be a
no-op, and the diff is many thousands of lines, check the first line of the file:

```bash
$ head -1 pnpm-lock.yaml
lockfileVersion: '9.0'
```

If that version changed, your [`pnpm`][pnpm] is older than the pinned version. [`pnpm`][pnpm] v8 and
below cannot read a `lockfileVersion` 9.0 file and, rather than failing, discard it and re-resolve
every dependency from scratch - which quietly changes the versions you are developing against.
Discard the damage and fix the [`pnpm`][pnpm] version per Section 1.2.c:

```bash
$ git checkout -- pnpm-lock.yaml
```

#### 1.5.c Node Version Failures

The `preinstall` script and most of the scripts in the `package.json` file run
`src/support/enforce-node-version.ts` first, which reports the mismatch plainly:

```
Your current node version, v16.0.0, does not satisfy the project's required version, >=22.
```

A syntax error thrown from inside a dependency, or an `ERR_PNPM_UNSUPPORTED_ENGINE` failure, has the
same cause. Run `nvm use` from the root of the project repository; see Section 1.2.a.ii.

## 2. Local Development

This section of the documentation describes various interactions that you will need to understand in
order to properly work with this application locally. This section assumes that you have already
completed the steps outlined in the prior section, "Getting Started".

### 2.1 IDE

This project is optimized for development using the [VSCode][vscode] IDE. While other IDEs may also
work in this repository, you must take steps to ensure that our editor configurations (like trimmed
whitespace, indentation, and `prettyprint` with [Prettier][prettier]) that are applied to this
repository while using [VSCode][vscode] are also consistently applied in your IDE. This ensures that
your commits will conform to the established repository style.

### 2.2 Running Locally

After pulling down the latest state of the repository, the development server can be started by
running the following command:

```bash
$ pnpm dev
```

**Note**: If changes were made to the `package.json` file, you may need to install the dependencies
via `pnpm install`.

### 2.3 Building

Before committing any changes you have made, you must ensure that you validate your work by ensuring
that you can successfully build the project:

```bash
$ pnpm build
```

This is required because [NextJS][nextjs] does not perform type checks while the development server
is running. Only the `build` command will compile the code and run all type checks.

Sometimes, you may get misleading results from the local build. For instance, you might notice that
the build is failing due to errors that you had just fixed, but were not picked up in the subsequent
build. This can happen because [NextJS][nextjs] will cache part of the build. To fix this, or as as
a general sanity-check, clear the cache before running the build:

```bash
$ rm -rf ./.next
$ pnpm build
```

You can also accomplish this via the `build:local` command, which is defined in the `package.json`
file:

```bash
$ pnpm build:local
```

**Note**: As of [NextJS][nextjs] 16, the `build` process no longer runs [ESLint][eslint] - the
built-in lint step was removed along with `next lint`. Linting must be run separately, via the
commands described in section 2.4, "Linting".

### 2.4 Linting

This project uses [ESLint][eslint] and [Prettier][prettier], with [Prettier][prettier] run from
inside of the [ESLint][eslint] configuration via `eslint-plugin-prettier`. Every fixable violation,
formatting included, is applied by [ESLint][eslint]'s `source.fixAll.eslint` code action when a file
is saved (a configuration that is defined in `./.vscode/settings.json`). If that is not desirable,
you can turn that setting off in your local [VSCode][vscode] settings.

Because that code action already applies the same fixes [ESLint][eslint] applies on the command
line, `editor.formatOnSave` is deliberately disabled for JS/TS files so that a second, near
identical formatting pass does not run on every save.

#### 2.4.a Formatting & Code Style

The philosophy that the project has in regard to formatting and/or code styles can be summarized as
follows:

> There is usually not a right or wrong answer, but it is better to choose than to not.

In other words, many formatting rules were not chosen for a specific reason other than having a
decision. It is better to rely on the available formatting tools to remove as much ambiguity as
possible, rather than spending time debating or arguing the rules themselves.

#### 2.4.b The [ESLint][eslint] Configuration

The [ESLint][eslint] configuration is isolated inside of the `tooling/eslint-config-web` directory,
which is a private, local package that the root `package.json` depends on via a `link:` dependency
(`@nickflorin/eslint-config-web`). Isolating it this way keeps the individual concerns of the
configuration - TypeScript, imports, React, Jest, stylistic rules, etc. - in separate, individually
readable modules rather than in one monolithic file:

| File                  | Responsibility                                                   |
| :-------------------- | :--------------------------------------------------------------- |
| `config.mjs`          | The barrel that composes every configuration module, in order.   |
| `configs/*.mjs`       | The individual, concern-scoped rule sets.                        |
| `support.mjs`         | Helpers that construct the composite rules (restricted imports). |
| `constants.mjs`       | Shared constants (rule severities, first-party module groups).   |
| `fast-formatting.mjs` | Derives a format-only configuration from the full configuration. |
| `eslint-progress.mjs` | An [ESLint][eslint] CLI wrapper that prints live file progress.  |

The root `eslint.config.mjs` extends that package and layers the project-specific concerns on top of
it. The root `eslint.config.format.mjs` derives a format-only variant of it, described below.

**Note**: The order in which the configuration modules are composed in `config.mjs` matters. In
particular, the Prettier configuration must come after the configurations whose rules it is
responsible for turning off.

#### 2.4.c Performing Linting Checks

To run both [ESLint][eslint] and [Prettier][prettier] over the project:

```bash
$ pnpm lint
```

To run only the checks that are reported as errors, ignoring warnings:

```bash
$ pnpm lint:errors
```

The two halves can also be run independently, via `pnpm eslint` and `pnpm prettier`. Spelling is
checked separately, by [cspell][cspell]:

```bash
$ pnpm cspell
```

#### 2.4.d Automatically Fixing Violations

Many [ESLint][eslint] violations - and every [Prettier][prettier] violation - can be fixed
automatically. To format the entire project with both:

```bash
$ pnpm format
```

A full [ESLint][eslint] fix pass evaluates the type-aware rules, which is slow. When
[ESLint][eslint] is only needed as a _formatter_ - most commonly after a large, generated change - a
format-only pass that strips every rule that is not auto-fixable is dramatically faster:

```bash
$ pnpm eslint:format:fast
```

To lint only the files that differ from `HEAD`, fixing what can be fixed:

```bash
$ pnpm eslint:changed
```

**Note**: `eslint:format:fast` is a local development convenience only. It is not a source of
correctness and must never be relied on in a CI or production environment.

### 2.5 Environment

There are 3 distinct environments that the application runs in, with the current environment being
dictated by the `NODE_ENV` environment variable:

| Environment (`NODE_ENV`) | Default Environment File | Override Environment File | Overridden by `.env.local` |
| :----------------------: | :----------------------: | :-----------------------: | :------------------------: |
|      `development`       |    `.env.development`    | `.env.development.local`  |            Yes             |
|       `production`       |    `.env.production`     |  `.env.production.local`  |            Yes             |
|          `test`          |       `.env.test`        |            N/A            |             No             |

Additionally, there is a third environment file, `.env`, that contains environment variables that
define environment variables for _all_ environments.

For each environment the default environment file specifies defaults that the environment variable
will have for the file's associated environment. These files should _always_ be committed to source
control.

When the environment is `development`, the default environment variables will be loaded from
`.env.development`. Similarly, when the environment is `production`, the default environment
variables will be loaded from `.env.production`. Finally, when the environment is `test`, the
default environment variables will be loaded from `.env.test`. In each case, any environment
variables defined in the environment specific file, `.env.${NODE_ENV}`, will override those defined
in the global environment variable file, `.env`.

#### 2.5.a Local Overrides

It is often necessary that the environment variables for any given environment be overridden, either
locally in development or on a server. When overriding the default environment variables for a given
environment is required, a `.env.local` file is used. The environment variables defined in this file
will override the default environment variables _only when in a `production` or `development`
environment_. If the environment is `test`, the environment variables in `.env.local` will not be
loaded.

Note that if you would like to override the environment variables for just a single environment, a
corresponding `.env.development.local` or `.env.production.local` file can be used. Each of these
files will be given precedence over the `.env.local` file.

For further documentation regarding the environment configuration, please see the
[NextJS Documentation](https://nextjs.org/docs/basic-features/environment-variables).

### 2.6 Testing

This documentation is intended to outline configurations, patterns and methodologies that are used
to test the Console application.

We use [Jest][jest] to handle integration and unit testing in the Console. The entire test suite can
be run with the following command:

```bash
$ pnpm test
```

#### 2.6.a Projects

Originally, there was only one configuration file for the testing suite, `jest.config.ts`. However,
due to the complexities of some of the tests that have to be run, the configuration had to be split
up into [projects](https://jestjs.io/docs/configuration#projects-arraystring--projectconfig), such
that certain tests can use different sets of configuration parameters that would not otherwise be
possible with a single configuration.

The following table describes the various aspects of each individual
[Jest](https://jestjs.io/docs/getting-started) project in the application:

|        Project        |             Config File             | Files Tested |  Test Files Located  |
| :-------------------: | :---------------------------------: | :----------: | :------------------: |
| Functional Unit Tests | `src/__tests__/unit/jest.config.ts` |    `.ts`     | `src/__tests__/unit` |

#### 2.6.b Linting

Linting is not part of the [Jest](https://jestjs.io/docs/getting-started) test suite - it is run
directly through [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/). See section
2.4, "Linting", for the full set of commands.

### 2.7 Database

This section of the documentation outlines how to manage the application database as it relates to
this application.

#### [postgres]

When developing locally, it is important that the [postgres] server is running. This service can be
started via [homebrew] as follows:

```bash
$ brew services start postgresql
```

Restarting the [postgres] service can be done as follows:

```bash
$ brew services restart postgresql
```

Stopping the [postgres] service can be done as follows:

```bash
$ brew services stop postgresql
```

#### 2.7.a Prisma

This application uses [Prisma][prisma], an ORM that that maps records in the database to typescript
objects while exposing a database client that can be used to interact with those records. To
properly use this client, a developer must understand how this ORM works.

##### 2.7.a.i Schema

The database structure for the application is defined in a [prisma] `*.schema` file. This
application's `*.schema` file is located at
[`src/prisma/schema.prisma`](./src/prisma/schema.prisma). The [prisma] ORM uses the definitions in
that file to properly construct, update and manage the [postgres] database.

When updates are made to the [prisma] schema file, migrations must be run such that [prisma] can
digest those changes and make the appropriate updates to the database structure. This can be done as
follows:

```bash
$ pnpm prisma:migrate
```

This command will prompt [prisma] to update the database structure if changes were detected. If
[prisma] detects changes, it will prompt you for a name that should be assigned to the accompanied
migration file (stored [here](./src/prisma/migrations/)). The name of the migration file should be a
snake-cake name that is indicative of the changes that were made (i.e.
"add_updated_at_field_to_user").

If it is desired that just the migration file is created (without actually updating the database),
the `--create-only` flag can be used:

```bash
$ pnpm prisma:migrate:create
```

This will create the migration file, but will not apply it.

##### 2.7.a.ii `PrismaClient`

The [`PrismaClient`](./src/server/db/index.ts) is what the application uses to communicate with the
database. This client ([`prisma`](./src/server/db/index.ts)) relies on type bindings that are
dynamically generated by [prisma] based on the existing schema file. This means that whenever the
schema file changes, the types for the [`PrismaClient`](./src/server/db/index.ts) will be incorrect
until the [`PrismaClient`](./src/server/db/index.ts) is regenerated.

This can be done as follows:

```bash
$ pnpm prisma:push
```

Note that when running the `reset` command (discussed below), the
[`PrismaClient`](./src/server/db/index.ts) is automatically updated.

##### 2.7.a.iii Seeding

The application comes equipped with a databae seed file
[`./src/prisma/seed.ts](./src/prisma/seed.ts). This file is used to populate the database with dummy
data/fixtures for development. This script can be run as:

```bash
$ pnpm prisma:seed
```

That being said, this seed process _only_ works when the database state is empty - if the database
state is not empty, unique constraint violations will be triggered when adding data to the database.
Therefore, in order to run the
[`./src/prisma/seed.ts](./src/prisma/seed.ts) script, it must be done as a part of [prisma]'s `reset`
flow:

```bash
$ pnpm prisma:migrate:reset
```

This command will wipe the current database, run all migrations and _then_ run the
[`./src/prisma/seed.ts](./src/prisma/seed.ts) script.

### 2.8 Content & Tooling Scripts

Beyond the build, lint, test and database commands described above, the `package.json` exposes a
handful of scripts that generate or synchronize content. Scripts that touch the database generally
have a `:prod` variant that loads the production environment instead of the development one; the
base form always targets the local development database.

#### 2.8.a Resume Generation

The print-form resume is generated from the content modules in
[`./src/documents/resume/data`](./src/documents/resume/data) and the React components in
[`./src/documents/resume/components`](./src/documents/resume/components). Generation is entirely
self-contained: it requires no database, no running application and no network.

```bash
$ pnpm resume:generate
```

This runs three phases in order, each of which is also available on its own:

| Command                         | Phase                                                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `pnpm resume:generate:html`     | Renders the sheets to static HTML and compiles the document stylesheet, emitting both with relative asset URLs |
| `pnpm resume:generate:pdf`      | Prints each emitted sheet with headless Chrome and merges the results into one PDF                             |
| `pnpm resume:generate:artifact` | Bundles the stacked view into a single self-contained HTML file with every asset inlined                       |

Everything is written to `./build/documents/resume`, which is ignored by git:

```
build/documents/resume/
├── html/                                 # Static pages, openable directly off disk
│   ├── index.html                        # Every sheet stacked, for reading on screen
│   ├── page-1.html                       # One standalone document per sheet
│   └── assets/                           # Compiled stylesheet, fonts, logos
├── resume.html                           # Single self-contained file, fully inlined
└── Resume-Aug-03-2026-5:12pm.pdf         # Timestamped, so exports are never overwritten
```

The PDF phase is the only one with an external requirement: it needs a Chrome-family browser, which
it looks for in the standard install locations. If Chrome lives somewhere else, point `CHROME_PATH`
at it:

```bash
$ CHROME_PATH="/path/to/chrome" pnpm resume:generate:pdf
```

The `:pdf` and `:artifact` phases both read the files that `:html` emits, so run `:html` at least
once before either of them on a clean checkout.

#### 2.8.b Repository Synchronization

Pulls the repositories from the GitHub API and stores any that are not yet present in the database.
Repositories that already exist are left untouched — the sync only ever creates — and newly created
rows are hidden (`visible: false`) so that they can be reviewed in the admin CMS before they appear
on the site.

```bash
$ pnpm repositories:sync
```

#### 2.8.c Experience Calculation

Recalculates the derived `calculatedExperience` value for every skill from the oldest course,
project and repository it is associated with, and writes the result back where it differs from what
is stored. It also acts as a check: if a skill carries a manually overridden `experience` value that
disagrees with the calculation, the script fails rather than writing over it.

```bash
$ pnpm experience:calculate
```

This script is restricted to the development environment. An `experience:calculate:prod` variant is
defined, but the script refuses to run outside of `development` and so it exits without doing any
work.

#### 2.8.d Fixtures

Dumps the contents of the production database to the JSON fixtures in
[`./src/database/fixtures/json`](./src/database/fixtures/json), which are what the seed process
reads. The dump is formatted with [prettier][prettier] as part of the same command.

```bash
$ pnpm fixtures:jsonify:prod
```

The formatting step can also be run on its own, which is useful after editing a fixture by hand:

```bash
$ pnpm fixtures:format
```

## 3. Production

This section of the documentation describes how to work with the application in a production
setting.

This application uses [Vercel][vercel] for its production infrastructure.

### 3.1 Deploying

The application's instance in [Vercel][vercel] is automatically configured to listen to changes on
either the `master` or `develop` branch, and automatically deploy.

When the `develop` branch changes, [Vercel][vercel] will automatically redeploy the application in a
`preview` environment. The URL of the deployed instance is dynamic, and can be retrieved directly
from the [Vercel][vercel] deployments dashboard.

When the `master` branch changes, [Vercel][vercel] will automatically redeploy the application in a
`production` environment, at the application's public and primary URL.

With this in mind, deploying the application is as simple as merging the most up to date changes
into the `master` branch (from the `develop` branch) and pushing up to the remote. When this
happens, [Vercel][vercel] will automatically redeploy the production instance.

First, checkout the `master` branch:

```bash
$ git checkout master
```

Then, make sure you have the latest changes from the `develop` branch on the remote:

```bash
$ git fetch origin develop
```

Then, merge the changes from `origin/develop` into `master`, making sure to use the `--ff-only` flag
to ensure that the commits are linear and can be applied directly on top of the last commit on
`master`:

```bash
$ git merge --ff-only origin/develop
```

Finally, push the changes up to `master` to trigger the deploy:

```bash
$ git push origin master
```

[psql]: https://www.postgresql.org/docs/current/app-psql.html
[homebrew]: https://brew.sh/
[postgresql]: https://www.postgresql.org/docs/current/app-psql.html
[nvm]: https://github.com/nvm-sh/nvm
[node]: https://nodejs.org/en/
[postgres]: https://www.postgresql.org/
[homepage]: ./ReadMe.md
[react]: https://reactjs.org/
[nextjs]: https://nextjs.org/
[prettier]: https://prettier.io/
[vscode]: https://code.visualstudio.com/
[eslint]: https://eslint.org/
[cspell]: https://cspell.org/
[jest]: https://jestjs.io/docs/getting-started
[sass]: https://sass-lang.com/
[prisma]: https://www.prisma.io/
[fontawesome]: https://fontawesome.com/docs
[pnpm]: https://pnpm.io/installation
[corepack]: https://nodejs.org/api/corepack.html
[ts-node]: https://typestrong.org/ts-node/
[vercel]: https://vercel.com/
[vercel-cli]: https://vercel.com/docs/cli
