import { resolveConfiguredDataDirectory } from './configured-data-directory';
import { YamlLedgerStore } from './ledger/yaml-ledger-store';
import { requirePreferences } from './preferences';
import { type SessionContext, SystemClock } from './session';

/**
 * Resolves everything a job-search command needs to read and write the ledger: the configured data
 * directory, its validated preferences, the ledger store over it, and the system clock.
 *
 * @throws {Error}
 *   If the data directory is not configured or fails its checks, or if the preferences are missing
 *   or invalid.
 *
 * @returns {Promise<SessionContext>} Everything a command needs to read and write the ledger.
 */
export const resolveSessionContext = async (): Promise<SessionContext> => {
  const dataDirectory = await resolveConfiguredDataDirectory();
  return {
    clock: SystemClock,
    dataDirectory,
    preferences: await requirePreferences(dataDirectory),
    store: new YamlLedgerStore(dataDirectory),
  };
};
