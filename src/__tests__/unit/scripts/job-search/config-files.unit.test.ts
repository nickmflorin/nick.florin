import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { stringify } from 'yaml';

import { inspectConfigFile, writeConfigFile } from '~/scripts/job-search/config-files';

import { MinimalPreferences } from './fixtures';

let sandbox = '';

describe('job-search configuration files', () => {
  beforeEach(async () => {
    sandbox = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'job-search-config-')));
  });

  afterEach(async () => {
    await fs.rm(sandbox, { force: true, recursive: true });
  });

  describe('inspectConfigFile()', () => {
    it('reports a file that has not been written, or a directory that does not exist', async () => {
      expect.hasAssertions();
      await expect(inspectConfigFile(sandbox, 'preferences')).resolves.toStrictEqual({
        status: 'missing',
      });
      await expect(inspectConfigFile(null, 'answers')).resolves.toStrictEqual({
        status: 'missing',
      });
    });

    it('lists the required fields that have not been given yet', async () => {
      expect.hasAssertions();
      await fs.writeFile(
        path.join(sandbox, 'preferences.yaml'),
        stringify({ hard: { ...MinimalPreferences.hard, sponsorshipRequired: undefined } }),
      );
      await expect(inspectConfigFile(sandbox, 'preferences')).resolves.toStrictEqual({
        missing: ['hard.sponsorshipRequired'],
        status: 'incomplete',
      });
    });

    it('reports a field that is present but wrong as invalid', async () => {
      expect.hasAssertions();
      await fs.writeFile(
        path.join(sandbox, 'preferences.yaml'),
        stringify({ hard: { ...MinimalPreferences.hard, workplace: ['moon'] } }),
      );
      await expect(inspectConfigFile(sandbox, 'preferences')).resolves.toMatchObject({
        status: 'invalid',
      });
    });

    it('reports a valid file as complete', async () => {
      expect.hasAssertions();
      await fs.writeFile(path.join(sandbox, 'preferences.yaml'), stringify(MinimalPreferences));
      await expect(inspectConfigFile(sandbox, 'preferences')).resolves.toStrictEqual({
        status: 'complete',
      });
    });
  });

  describe('writeConfigFile()', () => {
    it('writes the configuration as given, without expanding its defaults', async () => {
      expect.hasAssertions();
      const file = await writeConfigFile(
        sandbox,
        'preferences',
        JSON.stringify(MinimalPreferences),
      );
      await expect(fs.readFile(file, 'utf-8')).resolves.toBe(stringify(MinimalPreferences));
    });

    it('refuses an invalid configuration, leaving the stored one untouched', async () => {
      expect.hasAssertions();
      await writeConfigFile(sandbox, 'preferences', stringify(MinimalPreferences));
      await expect(
        writeConfigFile(sandbox, 'preferences', stringify({ hard: { workplace: [] } })),
      ).rejects.toThrow('The preferences configuration is invalid');
      await expect(inspectConfigFile(sandbox, 'preferences')).resolves.toStrictEqual({
        status: 'complete',
      });
    });
  });
});
