import path from 'node:path';

import { parse, stringify } from 'yaml';
import { type z } from 'zod';

import { readTextFile, writeFileAtomically } from './fs';
import { AnswersSchema, PreferencesSchema } from './schemas';

/**
 * The configuration files in the job-search data directory that the setup writes and every run
 * reads, with the schema each must satisfy.
 */
export const ConfigFiles = {
  answers: { fileName: 'answers.yaml', schema: AnswersSchema },
  preferences: { fileName: 'preferences.yaml', schema: PreferencesSchema },
} as const;

export const ConfigFileKinds = [
  'answers',
  'preferences',
] as const satisfies readonly (keyof typeof ConfigFiles)[];

export type ConfigFileKind = (typeof ConfigFileKinds)[number];

/**
 * Where a configuration file stands. `incomplete` means every problem is a required field that has
 * not been given yet, so the setup asks for exactly those fields; `invalid` means at least one
 * field is present but wrong, which the setup reports rather than silently overwriting.
 */
export type ConfigFileState =
  | { readonly issues: string[]; readonly status: 'invalid' }
  | { readonly missing: string[]; readonly status: 'incomplete' }
  | { readonly status: 'complete' }
  | { readonly status: 'missing' };

export const configFileIn = (dataDirectory: string, kind: ConfigFileKind): string =>
  path.join(dataDirectory, ConfigFiles[kind].fileName);

const describeIssue = (issue: z.ZodIssue): string =>
  `${issue.path.length === 0 ? '(root)' : issue.path.join('.')}: ${issue.message}`;

const isMissingField = (issue: z.ZodIssue): boolean =>
  issue.code === 'invalid_type' && issue.received === 'undefined';

const parseYaml = (text: string, file: string): unknown => {
  try {
    return parse(text);
  } catch (error) {
    throw new Error(`The configuration '${file}' is not valid YAML or JSON.`, { cause: error });
  }
};

/**
 * Reports where a configuration file stands: absent, missing required fields, invalid, or
 * complete.
 *
 * @param {null | string} dataDirectory
 *   The job-search data directory, or `null` when it has not been created yet.
 * @param {ConfigFileKind} kind The configuration file to inspect.
 *
 * @throws {Error} If the file is not valid YAML.
 *
 * @returns {Promise<ConfigFileState>}
 *   The state, with the paths of the missing fields or the descriptions of the invalid ones.
 */
export const inspectConfigFile = async (
  dataDirectory: null | string,
  kind: ConfigFileKind,
): Promise<ConfigFileState> => {
  const file = dataDirectory === null ? null : configFileIn(dataDirectory, kind);
  const text = file === null ? null : await readTextFile(file);
  if (file === null || text === null) {
    return { status: 'missing' };
  }
  const parsed = ConfigFiles[kind].schema.safeParse(parseYaml(text, file));
  if (parsed.success) {
    return { status: 'complete' };
  }
  const { issues } = parsed.error;
  return issues.every(isMissingField)
    ? { missing: issues.map(({ path: fieldPath }) => fieldPath.join('.')), status: 'incomplete' }
    : { issues: issues.map(describeIssue), status: 'invalid' };
};

/**
 * Validates a configuration and writes it to the data directory, atomically, as YAML.
 *
 * The configuration is written as given rather than with its defaults applied, so that the file
 * holds only what was decided and a default that later changes in the schema reaches it.
 *
 * @param {string} dataDirectory The job-search data directory.
 * @param {ConfigFileKind} kind The configuration file to write.
 * @param {string} text The configuration, as YAML or JSON.
 *
 * @throws {Error} If the configuration is not valid YAML or JSON, or does not satisfy the schema.
 *
 * @returns {Promise<string>} The path the configuration was written to.
 */
export const writeConfigFile = async (
  dataDirectory: string,
  kind: ConfigFileKind,
  text: string,
): Promise<string> => {
  const file = configFileIn(dataDirectory, kind);
  const raw = parseYaml(text, '(input)');
  const parsed = ConfigFiles[kind].schema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `The ${kind} configuration is invalid:\n${parsed.error.issues.map(describeIssue).join('\n')}`,
    );
  }
  await writeFileAtomically(file, stringify(raw, { lineWidth: 100 }));
  return file;
};
