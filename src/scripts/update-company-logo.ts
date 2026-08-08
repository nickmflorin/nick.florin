/**
 * Repoints a company's logo at a different file in `public/`.
 *
 * The CMS exposes no editor for a company's logo, so a logo asset that is renamed or replaced in
 * the repository leaves the stored `logoImageUrl` pointing at a file that no longer exists. This
 * script is the way to correct that against an environment's database.
 *
 * It writes nothing unless `--commit` is passed, so that the default of running it is to report
 * what would change.
 */
import { db } from '~/database/prisma';
import { cli } from '~/scripts';
import { stdout } from '~/support';

/**
 * Whether the update is actually written.
 *
 * The flag is read bare rather than through {@link cli.getBooleanCliArgument}, which requires an
 * `=value` assignment, because it reads as a switch at the call site — and because the safe
 * default has to be the one that takes no argument at all.
 */
const isCommitting = (): boolean => process.argv.slice(2).includes('--commit');

const script: cli.Script = async ctx => {
  const name = cli.getNamedArgument('name', { defaultValue: '' });
  const logo = cli.getNamedArgument('logo', { defaultValue: '' });

  if (name.length === 0 || logo.length === 0) {
    throw new Error(
      "Both '--name' and '--logo' are required, as in " +
        "--name='Craft Education System' --logo=/experience/craft.svg.",
    );
  } else if (!logo.startsWith('/')) {
    throw new Error(
      `The logo '${logo}' must be a root-relative path into 'public', as in ` +
        "'/experience/craft.svg'.",
    );
  }

  const company = await db.company.findFirst({ where: { name } });
  if (!company) {
    const available = (await db.company.findMany({ orderBy: { name: 'asc' } })).map(c => c.name);
    throw new Error(
      `No company is named '${name}'. The companies in this database are: ` +
        `${available.join(', ')}.`,
    );
  }

  stdout.info(`Company '${company.name}' (${company.id}).`);
  stdout.info(`  current logoImageUrl: ${company.logoImageUrl ?? '(null)'}`);
  stdout.info(`  new logoImageUrl:     ${logo}`);

  if (company.logoImageUrl === logo) {
    return stdout.complete('The logo already points there; nothing to do.');
  } else if (!isCommitting()) {
    return stdout.warn("Nothing was written. Re-run with '--commit' to apply the change.");
  }

  const updated = await db.company.update({
    data: { logoImageUrl: logo, updatedById: ctx.user.id },
    where: { id: company.id },
  });
  stdout.complete(`Updated '${updated.name}' to '${updated.logoImageUrl}'.`);
};

void cli.runScript(script, { devOnly: false, upsertUser: true });
