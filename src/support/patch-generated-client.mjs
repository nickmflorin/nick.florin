import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const GeneratedDirectory = join(
  dirname(fileURLToPath(import.meta.url)),
  "../database/model/generated",
);

/**
 * The files of the generated Prisma client that contain dynamic filesystem operations, and the
 * patterns within each that must be annotated for Turbopack.
 *
 * Turbopack statically traces filesystem and path expressions to build the NFT file list that the
 * host uses to decide which files each route actually needs.  Operations whose arguments are
 * runtime variables - the 'process.cwd()' probing in 'index.js', and the query-engine search loop,
 * dotenv tilde expansion and env-file reads in 'runtime/library.js' - cannot be statically scoped,
 * so Turbopack gives up and traces the entire project, emitting "Encountered unexpected file in
 * NFT list" during 'next build'.
 *
 * Every pattern excludes calls whose first traced argument is a string literal or '__dirname',
 * because those traces are required and statically bounded: the 'join(__dirname,
 * "../libquery_engine-*")' map in 'runtime/library.js' is what causes the engine binaries and
 * 'schema.prisma' to be included in the traced output.
 *
 * The 'turbopackIgnore' annotation excludes a call from build-time tracing without changing its
 * runtime behavior; the client still resolves 'schema.prisma', env files and the query engine
 * normally at runtime.
 */
const PatchTargets = [
  {
    file: "index.js",
    patterns: [
      {
        pattern: /path\.join\(process\.cwd\(\), (?=[A-Za-z_$])/g,
        replacement: "path.join(/*turbopackIgnore: true*/ process.cwd(), ",
      },
    ],
  },
  {
    file: "runtime/library.js",
    patterns: [
      {
        pattern:
          /([A-Za-z_$][\w$]*(?:\.default)?\.(?:join|resolve)\()(?=(?!__dirname)[A-Za-z_$](?![\w$]*\.homedir))/g,
        replacement: "$1/*turbopackIgnore: true*/ ",
      },
      {
        pattern:
          /([A-Za-z_$][\w$]*(?:\.default)?\.(?:existsSync|readFileSync|statSync|readdirSync|realpathSync|lstatSync)\()(?=(?!__dirname)[A-Za-z_$])/g,
        replacement: "$1/*turbopackIgnore: true*/ ",
      },
      {
        pattern: /(\.join\()(?=[A-Za-z_$][\w$]*\.homedir)/g,
        replacement: "$1/*turbopackIgnore: true*/ ",
      },
    ],
  },
];

/**
 * Annotates the dynamic filesystem operations in the generated Prisma client so that Turbopack does
 * not trace the entire project into the build.  This runs after every 'prisma generate', because
 * the generator rewrites the generated folder in full and discards any previous annotation.
 *
 * If none of a target file's expected patterns match - and no prior annotation is present in that
 * file - this fails loudly: a Prisma upgrade has changed the generated output, and the patch must
 * be revisited or removed rather than silently stop applying.
 */
for (const target of PatchTargets) {
  const filePath = join(GeneratedDirectory, target.file);
  let content = readFileSync(filePath, "utf8");
  let annotated = 0;

  for (const { pattern, replacement } of target.patterns) {
    annotated += (content.match(pattern) ?? []).length;
    content = content.replace(pattern, replacement);
  }

  if (annotated === 0) {
    if (!content.includes("turbopackIgnore")) {
      throw new Error(
        `The generated Prisma client file '${target.file}' no longer contains any of the ` +
          "expected dynamic filesystem operations. The Prisma generator output has likely " +
          "changed; update or remove 'src/support/patch-generated-client.mjs' accordingly.",
      );
    }
    /* eslint-disable-next-line no-console
       -- Build script; the application logger is not in context here. */
    console.info(`'${target.file}' is already annotated for Turbopack.`);
  } else {
    writeFileSync(filePath, content);
    /* eslint-disable-next-line no-console
       -- Build script; the application logger is not in context here. */
    console.info(
      `Annotated ${annotated} dynamic filesystem operation(s) in '${target.file}' for Turbopack.`,
    );
  }
}
