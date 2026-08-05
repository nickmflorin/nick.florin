/**
 * A thin wrapper around the ESLint CLI that prints each file to the terminal as ESLint actually
 * lints or fixes it, so a long local formatting or linting pass shows live progress instead of
 * sitting silent until it finishes.
 *
 * ESLint exposes no public per-file progress hook: formatters only run once every file has been
 * processed, and the default formatter prints nothing for files without problems. The one signal
 * emitted as each file is processed is ESLint's internal 'eslint:linter' debug log, so this wrapper
 * runs the CLI with that single debug namespace enabled, reads its stderr, and rewrites the
 * 'Linting code for <path>' lines into a tidy '<label> <relative-path>' progress feed.
 *
 * When ESLint is run with '--fix', the wrapper also records each file's size and modification time
 * as it is processed and, once the pass completes, prints a summary of the files the fix pass
 * actually rewrote. ESLint writes all '--fix' changes in a single batch when the run ends, so this
 * changed-file set can only be reported after the pass finishes rather than as each file streams.
 *
 * Because it leans on an internal debug namespace rather than a documented API, this is intended
 * for local development only and should never be relied on in CI or production.
 *
 * Behavior that is preserved so the wrapper is a safe drop-in for a bare ESLint invocation:
 * 1. ESLint's own stdout (the formatter results) is inherited untouched, so problem output and
 *    colors render exactly as normal.
 * 2. Real stderr output (configuration errors, crashes) is passed through; only the
 *    'eslint:linter' debug lines are intercepted, with the noisy 'Verify' lines dropped.
 * 3. ESLint's exit code is propagated, so a script using this as a lint check still fails on
 *    unresolved errors.
 *
 * Usage: `ESLINT_PROGRESS_LABEL=formatting node path/to/eslint-progress.mjs <eslint args...>`.
 * Every argument is forwarded verbatim to ESLint, with the exception of the wrapper-only
 * '--type-aware' flag (see {@link TypeAwareFlag}). The label defaults to 'linting', and the
 * rolling window size defaults to 10, overridable via 'ESLINT_PROGRESS_MAX_LINES'.
 */
import { spawn } from 'node:child_process';
import { statSync } from 'node:fs';
import { relative } from 'node:path';
import { createInterface } from 'node:readline';

/**
 * The 'eslint:linter' debug prefix that immediately precedes the absolute path of the file ESLint
 * is currently linting. Lines containing it are rewritten into the progress feed.
 */
const LintingMarker = 'eslint:linter Linting code for ';

/**
 * The verb shown in front of each file in the progress feed, controlled by the consuming script so
 * a formatting pass reads differently from a linting pass.
 */
const ProgressLabel = process.env.ESLINT_PROGRESS_LABEL ?? 'linting';

const BoldYellow = '[1;33m';
const ResetStyle = '[0m';

const BoldDarkGray = '[1;90m';

const GreenCheckMark = '✅';

/**
 * The progress label rendered in bold yellow, applied only when stderr is an interactive terminal
 * and 'NO_COLOR' is unset so piped or redirected output stays plain text.
 */
const StyledLabel =
  process.stderr.isTTY && !process.env.NO_COLOR
    ? `${BoldYellow}${ProgressLabel}${ResetStyle}`
    : ProgressLabel;

/**
 * The maximum number of recently processed files shown in the live progress window when stderr is
 * an interactive terminal. Older entries scroll out of the window so the terminal does not grow
 * without bound during a large pass. Overridable via 'ESLINT_PROGRESS_MAX_LINES'.
 */
const MaxVisibleFiles = Number.parseInt(process.env.ESLINT_PROGRESS_MAX_LINES ?? '', 10) || 10;

/**
 * Whether the progress feed is rendered as an in-place window that rewrites itself, which requires
 * stderr to be an interactive terminal. When stderr is piped or redirected, each file is instead
 * appended on its own line so the captured output remains a complete, scrollable log.
 */
const RendersInPlaceWindow = process.stderr.isTTY === true;

/**
 * The ANSI escape that clears the terminal from the cursor to the end of the screen, used to erase
 * the previously drawn window before it is redrawn.
 */
const ClearToScreenEnd = '[0J';

/**
 * The wrapper-only flag that opts a formatting run into type-aware mode. It is not an ESLint flag:
 * the wrapper strips it from the forwarded arguments and instead sets the
 * 'ESLINT_FORMAT_TYPE_AWARE' environment variable for the child process, which the project's
 * eslint.config.format.mjs reads to derive its format-only configuration with the auto-fixable
 * type-aware rules (and the type-aware parser options they need) retained.
 */
const TypeAwareFlag = '--type-aware';

/**
 * Whether the run was opted into type-aware formatting via the {@link TypeAwareFlag}.
 */
const IsTypeAware = process.argv.slice(2).includes(TypeAwareFlag);

/**
 * Rewrites the value of ESLint's '--cache-location' argument, in either its space-separated or its
 * '=' form, with a '.type-aware' suffix so a type-aware run keeps its own cache file. The two
 * modes resolve different configurations, and ESLint discards a cached result whenever the
 * configuration that produced it changes, so sharing one cache file would have each mode wipe out
 * the other's cache every time the flag is toggled.
 *
 * @param {string[]} args The arguments being forwarded to ESLint.
 *
 * @returns {string[]} The arguments with any '--cache-location' value suffixed.
 */
const withTypeAwareCacheLocation = args =>
  args.map((arg, index) => {
    if (args[index - 1] === '--cache-location' || arg.startsWith('--cache-location=')) {
      return `${arg}.type-aware`;
    }
    return arg;
  });

/**
 * The arguments forwarded to the ESLint CLI: everything the wrapper received, minus the
 * wrapper-only {@link TypeAwareFlag}, with the cache location suffixed via
 * {@link withTypeAwareCacheLocation} when the flag was provided.
 */
const ForwardedArgs = IsTypeAware
  ? withTypeAwareCacheLocation(process.argv.slice(2).filter(arg => arg !== TypeAwareFlag))
  : process.argv.slice(2);

/**
 * ESLint is launched through 'pnpm exec' so the binary resolves the same way the bare scripts
 * resolved it, rather than depending on ESLint's package 'exports' map (which does not expose the
 * 'bin/eslint.js' entry point for direct resolution). The single 'eslint:linter' debug namespace is
 * enabled so each file emits a progress line as it is processed; every other namespace stays off to
 * keep the stream limited to the per-file markers this wrapper rewrites.
 */
const child = spawn('pnpm', ['exec', 'eslint', ...ForwardedArgs], {
  env: Object.assign(
    {},
    process.env,
    { DEBUG: 'eslint:linter' },
    IsTypeAware ? { ESLINT_FORMAT_TYPE_AWARE: '1' } : {},
  ),
  stdio: ['inherit', 'inherit', 'pipe'],
});

/**
 * Whether the wrapper tracks the files rewritten by the run, which is only meaningful when ESLint
 * is invoked with '--fix'. For a lint-only pass nothing is written, so the tracking and its
 * per-file 'statSync' calls are skipped entirely.
 */
const CollectsChangedFiles = ForwardedArgs.includes('--fix');

/**
 * A map of the absolute path of each file ESLint has processed to a 'mtime:size' signature captured
 * the first time the file was seen, before ESLint's end-of-run '--fix' write. Comparing each
 * signature against the file's post-run state identifies the files the fix pass rewrote.
 */
const fileSnapshots = new Map();

const recentPaths = [];
let renderedLineCount = 0;
let lastReportedPath = null;

const snapshotFile = absolutePath => {
  if (!CollectsChangedFiles || fileSnapshots.has(absolutePath)) {
    return;
  }
  try {
    const stats = statSync(absolutePath);
    fileSnapshots.set(absolutePath, `${stats.mtimeMs}:${stats.size}`);
  } catch {
    // A path ESLint reports may be virtual or removed mid-run and so cannot be compared; skip it.
  }
};

/**
 * Determines which of the snapshotted files were rewritten by the '--fix' pass by re-stat'ing each
 * and comparing against its pre-fix signature. A changed signature is a precise signal of a rewrite
 * because ESLint writes a file only when its fixed content differs from the original.
 *
 * @returns {string[]} The repository-relative paths of the rewritten files, sorted alphabetically.
 */
const collectChangedFiles = () => {
  const changed = [];
  for (const [absolutePath, signature] of fileSnapshots) {
    try {
      const stats = statSync(absolutePath);
      if (`${stats.mtimeMs}:${stats.size}` !== signature) {
        changed.push(relative(process.cwd(), absolutePath));
      }
    } catch {
      // A file present at snapshot time but unreadable now cannot be reported as changed; skip it.
    }
  }
  return changed.sort();
};

/**
 * Prints the summary of files rewritten by the '--fix' pass to stderr once the run completes. The
 * summary is omitted entirely when the run did not use '--fix' or when no file was changed, so a
 * clean pass adds no output.
 */
const writeChangedSummary = () => {
  if (!CollectsChangedFiles) {
    return;
  }
  const changed = collectChangedFiles();
  if (changed.length === 0) {
    return;
  }
  const heading = `(${changed.length}) files changed from ${ProgressLabel}`;
  const styledHeading =
    process.stderr.isTTY && !process.env.NO_COLOR
      ? `${BoldDarkGray}${heading}${ResetStyle}`
      : heading;
  const list = changed.map((path, index) => `  ${index + 1}. ${path}`).join('\n');
  process.stderr.write(`\n${GreenCheckMark} ${styledHeading}\n${list}\n`);
};

/**
 * Truncates a path so the rendered '<label> <path>' line fits within the terminal width on a single
 * physical row, which keeps the cursor arithmetic in {@link renderProgressWindow} correct when a
 * path would otherwise wrap onto a second row. The leading portion is replaced with an ellipsis so
 * the file name, the most useful part, stays visible.
 *
 * @param {string} relativePath The repository-relative path to fit.
 *
 * @returns {string} The path, truncated from the left with an ellipsis when it would overflow.
 */
const fitPathToWidth = relativePath => {
  const available = (process.stderr.columns ?? 80) - ProgressLabel.length - 1;
  if (available <= 1 || relativePath.length <= available) {
    return relativePath;
  }
  return `…${relativePath.slice(relativePath.length - available + 1)}`;
};

/**
 * Redraws the in-place progress window from {@link recentPaths}, moving the cursor back up over the
 * lines drawn on the previous render and clearing them so only the most recent
 * {@link MaxVisibleFiles} files remain on screen.
 */
const renderProgressWindow = () => {
  const moveToWindowStart = renderedLineCount > 0 ? `[${renderedLineCount}A` : '';
  const lines = recentPaths.map(path => `${StyledLabel} ${fitPathToWidth(path)}`).join('\n');
  process.stderr.write(`${moveToWindowStart}${ClearToScreenEnd}${lines}\n`);
  renderedLineCount = recentPaths.length;
};

/**
 * Erases the in-place progress window so a passthrough stderr line, such as a configuration error,
 * can be printed cleanly above where the window resumes on the next {@link renderProgressWindow}.
 */
const clearProgressWindow = () => {
  if (renderedLineCount > 0) {
    process.stderr.write(`[${renderedLineCount}A${ClearToScreenEnd}`);
    renderedLineCount = 0;
  }
};

/**
 * Adds a newly processed file to the progress feed, redrawing the capped in-place window when
 * stderr is an interactive terminal ({@link RendersInPlaceWindow}) and appending a single line
 * otherwise.
 *
 * @param {string} relativePath The repository-relative path of the file ESLint just processed.
 */
const reportFile = relativePath => {
  if (!RendersInPlaceWindow) {
    process.stderr.write(`${StyledLabel} ${relativePath}\n`);
    return;
  }
  recentPaths.push(relativePath);
  if (recentPaths.length > MaxVisibleFiles) {
    recentPaths.shift();
  }
  renderProgressWindow();
};

const stderrLines = createInterface({ input: child.stderr });
stderrLines.on('line', line => {
  const markerIndex = line.indexOf(LintingMarker);
  if (markerIndex !== -1) {
    const filePath = line.slice(markerIndex + LintingMarker.length).replace(/ \(pass \d+\)$/, '');
    snapshotFile(filePath);
    if (filePath !== lastReportedPath) {
      lastReportedPath = filePath;
      reportFile(relative(process.cwd(), filePath));
    }
    return;
  }
  if (line.includes('eslint:linter')) {
    return;
  }
  clearProgressWindow();
  process.stderr.write(`${line}\n`);
});

/**
 * ESLint's exit code, captured on the child's 'close' event but not acted on until stderr has also
 * fully drained. ESLint prints a fatal error (exit code 2) to stderr immediately before it exits,
 * so exiting the moment the child closes would race that output: any stderr still buffered in the
 * pipe and not yet emitted as a 'line' would be discarded, leaving such failures to surface as a
 * bare exit 2 with no error shown.
 */
let childExitCode = null;
let isStderrDrained = false;

/**
 * Finalizes the run once ESLint has exited AND its stderr has been fully read and echoed: prints
 * the changed-file summary and sets the exit code. It sets {@link process.exitCode} rather than
 * calling {@link process.exit}, so buffered stdout/stderr writes flush before the process exits
 * instead of being truncated.
 */
const finalize = () => {
  if (childExitCode === null || !isStderrDrained) {
    return;
  }
  writeChangedSummary();
  process.exitCode = childExitCode;
};

stderrLines.on('close', () => {
  isStderrDrained = true;
  finalize();
});

child.on('error', error => {
  process.stderr.write(`Failed to run ESLint: ${error.message}\n`, () => process.exit(1));
});
child.on('close', code => {
  childExitCode = code ?? 0;
  finalize();
});
