import { configFileIn } from './config-files';
import { readYamlRecord } from './ledger/yaml-records';
import { type Preferences, PreferencesSchema } from './schemas';

/**
 * Reads and validates `preferences.yaml` from the data directory.
 *
 * @param {string} dataDirectory The job-search data directory.
 *
 * @throws {Error}
 *   If the file is missing, which means the job-search setup has not been run, or if it does not
 *   satisfy the schema.
 *
 * @returns {Promise<Preferences>} The preferences, with every default applied.
 */
export const requirePreferences = async (dataDirectory: string): Promise<Preferences> => {
  const file = configFileIn(dataDirectory, 'preferences');
  const preferences = await readYamlRecord(file, PreferencesSchema);
  if (preferences === null) {
    throw new Error(
      `There is no '${file}'. Run the job-search setup to create it before running any command ` +
        'that depends on it.',
    );
  }
  return preferences;
};
