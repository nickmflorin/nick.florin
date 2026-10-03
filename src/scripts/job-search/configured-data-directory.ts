import { environment } from '~/environment';

import { type DataDirectoryOptions, resolveDataDirectory } from './data-directory';

/**
 * Resolves the job-search data directory configured by the `JOBS_DATA_DIR` environment variable.
 *
 * The variable is expected in `.env.local`, which is gitignored, because its value locates personal
 * data. See {@link resolveDataDirectory} for the checks the location must pass.
 *
 * @param {DataDirectoryOptions} options Whether a missing directory is created.
 *
 * @returns {Promise<string>} The real path of the data directory.
 */
export const resolveConfiguredDataDirectory = async (
  options?: DataDirectoryOptions,
): Promise<string> => {
  const { JOBS_DATA_DIR } = environment.pick(['JOBS_DATA_DIR']);
  if (JOBS_DATA_DIR === undefined || JOBS_DATA_DIR === '') {
    return environment.throwConfigurationError(
      'JOBS_DATA_DIR',
      'The job-search data directory must be configured in .env.local, outside the repository.',
    );
  }
  return resolveDataDirectory(JOBS_DATA_DIR, options);
};
