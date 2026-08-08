/**
 * Transcodes the animated GIFs under `media/project-recordings/` into web video, writing an H.264
 * `.mp4` and a VP9 `.webm` into the matching directory under `public/projects/`.
 *
 * The GIFs are silent UI screen recordings. Serving them directly is what this pipeline exists to
 * avoid - no image pipeline compresses an animated GIF, so they shipped at full size - which is
 * why the sources live outside `public/`: they are retained as the input to re-run this script
 * from whenever the encoding settings change, but they are never served. Both encodes back a
 * `<video>`: the `.webm` is the preferred source and the `.mp4` is what Safari and iOS fall back
 * to.
 */
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import ffmpegPath from 'ffmpeg-static';

import { isError } from '~/application/errors';
import { getBooleanCliArgument, getNamedArgument } from '~/scripts/cli/args';
import { stdout } from '~/support';

const execFileAsync = promisify(execFile);

/**
 * The directory holding the source recordings, which is deliberately outside `public/` so that
 * the GIFs are retained by the repository without being served.
 */
const SourceDir = path.join(process.cwd(), 'media', 'project-recordings');

const SourceDirName = path.join('media', 'project-recordings');

/**
 * The directory the encoded video is written into, mirroring the source's subdirectories so that
 * a recording at `media/project-recordings/greenbudget/x.gif` is served from
 * `/projects/greenbudget/x.webm`.
 */
const OutputDir = path.join(process.cwd(), 'public', 'projects');

/**
 * The flags every invocation opens with, ahead of the input.
 *
 * ffmpeg writes its banner and its per-frame progress to stderr, all of which `execFile` buffers
 * in memory, so everything below an error is suppressed.
 */
const FfmpegBaseFlags = ['-hide_banner', '-loglevel', 'error', '-nostats', '-y'];

/**
 * The stderr buffer a single encode is allowed.
 *
 * Node's one-megabyte default is ample for the errors ffmpeg is configured to report, but a failed
 * encode can emit a long diagnostic and truncating it would lose the reason for the failure.
 */
const FfmpegOutputBuffer = 8 * 1024 * 1024;

/**
 * The scale filter every output is encoded through.
 *
 * H.264 rejects odd frame dimensions, and the recordings were captured at whatever size the window
 * happened to be, so each dimension is rounded down to the nearest even number.
 */
const EvenDimensionsFilter = 'scale=trunc(iw/2)*2:trunc(ih/2)*2';

interface OutputFormat {
  /**
   * The codec and container flags, applied after the input and the shared scale filter.
   */
  readonly args: readonly string[];
  readonly extension: string;
}

/**
 * The video files emitted for each source GIF.
 *
 * Both are constrained to the `yuv420p` pixel format, which is the only one Safari and iOS decode
 * for H.264 and the one every browser handles for VP9.
 */
const OutputFormats = [
  {
    args: [
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '23',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
    ],
    extension: '.mp4',
  },
  {
    args: [
      '-c:v',
      'libvpx-vp9',
      '-crf',
      '32',
      '-b:v',
      '0',
      '-cpu-used',
      '2',
      '-row-mt',
      '1',
      '-pix_fmt',
      'yuv420p',
    ],
    extension: '.webm',
  },
] as const satisfies readonly OutputFormat[];

interface TranscodeTotals {
  readonly sourceBytes: number;
  readonly targetBytes: number;
}

/**
 * Returns the path to the `ffmpeg` executable that `ffmpeg-static` ships.
 *
 * The package exports `null` rather than throwing on a platform it carries no binary for, so the
 * absence is converted into an error here rather than surfacing later as a spawn failure.
 *
 * @throws {Error} If the package ships no binary for the current platform.
 *
 * @returns {string} The absolute path to the executable.
 */
const resolveFfmpeg = (): string => {
  if (ffmpegPath === null) {
    throw new Error(
      "The 'ffmpeg-static' package ships no binary for this platform, so the project GIFs " +
        'cannot be transcoded here.',
    );
  }
  return ffmpegPath;
};

/**
 * Reads the `--dry-run` flag.
 *
 * The flag is accepted bare as well as in the `--dry-run=false` form, because a dry run reads as a
 * bare switch while {@link getBooleanCliArgument} requires an assignment.
 *
 * @returns {boolean} Whether the run reports what it would do without writing anything.
 */
const isDryRun = (): boolean =>
  process.argv.slice(2).includes('--dry-run') ||
  getBooleanCliArgument('dry-run', { defaultValue: false });

const findGifs = async (directory: string): Promise<string[]> => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const found = await Promise.all(
    entries.map(async entry => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findGifs(entryPath);
      }
      return path.extname(entry.name).toLowerCase() === '.gif' ? [entryPath] : [];
    }),
  );
  return found.flat().sort();
};

const formatBytes = (bytes: number): string => `${(bytes / 1_000_000).toFixed(2)} MB`;

const formatSavings = (sourceBytes: number, targetBytes: number): string =>
  `${(((sourceBytes - targetBytes) / sourceBytes) * 100).toFixed(1)}% smaller`;

const targetPath = (source: string, extension: string): string => {
  const relative = path.relative(SourceDir, source);
  const stem = path.join(path.dirname(relative), path.basename(relative, path.extname(relative)));
  return path.join(OutputDir, `${stem}${extension}`);
};

/**
 * Encodes one GIF into every format in {@link OutputFormats}, writing each beside the source.
 *
 * @param {string} ffmpeg The path to the `ffmpeg` executable.
 * @param {string} source The absolute path to the GIF being encoded.
 * @param {boolean} dryRun Whether to report the outputs rather than write them.
 *
 * @returns {Promise<TranscodeTotals>} The size of the source and of everything emitted from it.
 */
const transcodeGif = async (
  ffmpeg: string,
  source: string,
  dryRun: boolean,
): Promise<TranscodeTotals> => {
  const sourceBytes = (await fs.stat(source)).size;
  const output = stdout.begin(`${path.relative(SourceDir, source)} (${formatBytes(sourceBytes)})`);

  let targetBytes = 0;
  for (const format of OutputFormats) {
    const target = targetPath(source, format.extension);
    if (dryRun) {
      output.info(`Would write '${path.basename(target)}'.`);
    } else {
      /* eslint-disable-next-line no-await-in-loop -- The formats are encoded one at a time because
         a single ffmpeg process already saturates the available cores. */
      await execFileAsync(
        ffmpeg,
        [
          ...FfmpegBaseFlags,
          '-i',
          source,
          '-an',
          '-vf',
          EvenDimensionsFilter,
          ...format.args,
          target,
        ],
        { maxBuffer: FfmpegOutputBuffer },
      );
      /* eslint-disable-next-line no-await-in-loop -- Part of the sequential encode above; each
         output is measured as it is written. */
      const bytes = (await fs.stat(target)).size;
      targetBytes += bytes;
      output.success(
        `Wrote '${path.basename(target)}' (${formatBytes(bytes)}, ` +
          `${formatSavings(sourceBytes, bytes)}).`,
      );
    }
  }

  output.complete(
    dryRun
      ? `Would write ${OutputFormats.length} file(s) beside '${path.basename(source)}'.`
      : `Wrote ${OutputFormats.length} file(s) totalling ${formatBytes(targetBytes)}, ` +
          `${formatSavings(sourceBytes, targetBytes)} than the source.`,
  );
  return { sourceBytes, targetBytes };
};

const transcodeProjectGifs = async (): Promise<void> => {
  const dryRun = isDryRun();
  const only = getNamedArgument('only', { defaultValue: '' });

  const sources = (await findGifs(SourceDir)).filter(source =>
    path.relative(process.cwd(), source).includes(only),
  );
  if (sources.length === 0) {
    stdout.warn(
      only.length === 0
        ? `No GIFs were found under '${SourceDirName}'.`
        : `No GIFs under '${SourceDirName}' match '${only}'.`,
    );
    return;
  }

  const ffmpeg = resolveFfmpeg();
  stdout.info(
    `${dryRun ? 'Planning' : 'Transcoding'} ${sources.length} GIF(s) with the ffmpeg executable ` +
      `at '${ffmpeg}'.`,
  );

  let sourceTotal = 0;
  let targetTotal = 0;
  for (const source of sources) {
    /* eslint-disable-next-line no-await-in-loop -- The inputs are encoded in sequence so that the
       log reads in order and the encodes do not contend for the same cores. */
    const totals = await transcodeGif(ffmpeg, source, dryRun);
    sourceTotal += totals.sourceBytes;
    targetTotal += totals.targetBytes;
  }

  if (dryRun) {
    stdout.complete(
      `Would transcode ${sources.length} GIF(s) totalling ${formatBytes(sourceTotal)} into ` +
        `${sources.length * OutputFormats.length} video file(s). Nothing was written.`,
    );
  } else {
    stdout.complete(
      `Transcoded ${sources.length} GIF(s): ${formatBytes(sourceTotal)} in, ` +
        `${formatBytes(targetTotal)} out (${formatSavings(sourceTotal, targetTotal)}). The ` +
        'source GIFs were left in place.',
    );
  }
};

void transcodeProjectGifs().catch((e: unknown) => {
  stdout.error(isError(e) ? e : String(e));
  process.exit(1);
});
