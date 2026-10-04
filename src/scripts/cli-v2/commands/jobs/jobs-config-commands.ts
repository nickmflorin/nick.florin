import { text } from 'node:stream/consumers';

import { Command, Option } from 'clipanion';
import { z } from 'zod';

import {
  ConfigFileKinds,
  inspectConfigFile,
  writeConfigFile,
} from '~/scripts/job-search/config-files';
import { resolveConfiguredDataDirectory } from '~/scripts/job-search/configured-data-directory';
import { DataDirectoryMissingError } from '~/scripts/job-search/data-directory';

import { zodValidator } from '../../args/zod-validator';
import { JsonCommand, type JsonResult } from '../json-command';

const resolveExistingDataDirectory = async (): Promise<null | string> => {
  try {
    return await resolveConfiguredDataDirectory();
  } catch (error) {
    if (error instanceof DataDirectoryMissingError) {
      return null;
    }
    throw error;
  }
};

/**
 * Reports where a job-search configuration file stands, so that the setup knows whether to create
 * it, ask only for the fields it is missing, or leave it alone.
 */
export class JobsConfigStatusCommand extends JsonCommand {
  public static override paths = [['jobs', 'config', 'status']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Report whether a job-search configuration file is missing, incomplete or valid.',
    details: `
      The status is \`missing\` before the setup has written the file, \`incomplete\` with the paths
      of the required fields not given yet, \`invalid\` with a description of each problem, or
      \`complete\`. A data directory that does not exist yet reads as \`missing\`.
    `,
    examples: [
      ['Check the preferences', '$0 jobs config status preferences'],
      ['Check the application answers', '$0 jobs config status answers'],
    ],
  });
  public kind = Option.String({
    name: 'file',
    required: true,
    validator: zodValidator(z.enum(ConfigFileKinds)),
  });

  protected async run(): Promise<JsonResult> {
    return inspectConfigFile(await resolveExistingDataDirectory(), this.kind);
  }
}

/**
 * Validates a job-search configuration file read from standard input and writes it to the data
 * directory, creating the directory on the first write.
 */
export class JobsConfigWriteCommand extends JsonCommand {
  public static override paths = [['jobs', 'config', 'write']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Validate a job-search configuration file and write it to the data directory.',
    details: `
      Reads the whole file, as YAML or JSON, from standard input and replaces the stored one only if
      it satisfies the schema. Creates the data directory on the first write, after the outside-
      every-repository check.
    `,
    examples: [['Write the preferences', '$0 jobs config write preferences < preferences.yaml']],
  });
  public kind = Option.String({
    name: 'file',
    required: true,
    validator: zodValidator(z.enum(ConfigFileKinds)),
  });

  protected async run(): Promise<JsonResult> {
    const input = await text(this.context.stdin);
    const dataDirectory = await resolveConfiguredDataDirectory({ create: true });
    return { path: await writeConfigFile(dataDirectory, this.kind, input), status: 'written' };
  }
}
