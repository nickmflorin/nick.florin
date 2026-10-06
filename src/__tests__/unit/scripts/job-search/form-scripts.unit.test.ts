import { Script } from 'node:vm';

import {
  chooseOptionScript,
  formFillScript,
  FormScripts,
  FormToolsGoneMessage,
  revealFileInputScript,
} from '~/scripts/job-search/applying/form-scripts';

/**
 * Compiles a page script the way the browser does, without running it, so that a broken escape in
 * a script's template literal fails here rather than in the page.
 */
const compile = (script: string): Script => new Script(`(${script});`);

describe('form scripts', () => {
  it.each(Object.entries(FormScripts))('compiles the %s script', (_name, script) => {
    expect(compile(script)).toBeInstanceOf(Script);
  });

  it('emits the sign-in patterns with their escapes intact', () => {
    expect([
      FormScripts['form-read'].includes(
        String.raw`/\/(?:login|signin|sign-in|authwall|checkpoint|uas\/login)\b/i`,
      ),
      FormScripts['form-read'].includes(
        String.raw`/current step \d+ of \d+\s+(create account\s*\/\s*)?sign in/i`,
      ),
    ]).toStrictEqual([true, true]);
  });

  it.each([
    ['form-reread', FormScripts['form-reread']],
    ['combobox-options', FormScripts['combobox-options']],
    ['choose-option', chooseOptionScript('No')],
    ['reveal', revealFileInputScript('f16')],
  ])(
    'reports that the form tools are gone when %s runs on a page not read',
    async (_name, script) => {
      expect.hasAssertions();
      const serialized: unknown = new Script(
        `(${script})().then((result) => JSON.stringify(result));`,
      ).runInNewContext({ window: {} });
      await expect(serialized).resolves.toBe(JSON.stringify({ error: FormToolsGoneMessage }));
    },
  );

  it('compiles the choose-option script with quotes and hints in the value', () => {
    expect(
      compile(chooseOptionScript('O\'Hare, "IL"', ['Illinois', 'United States'])),
    ).toBeInstanceOf(Script);
  });

  it('embeds the key, type and value of each fill, and nothing else', () => {
    const script = formFillScript([
      { key: 'f0', label: 'Email', type: 'text', value: 'jane@example.com', widget: 'native' },
      { key: 'f1', label: 'Follow Hooli', type: 'checkbox', value: false, widget: 'native' },
    ]);
    expect(compile(script)).toBeInstanceOf(Script);
    expect(script).toContain(
      `fill(${JSON.stringify([
        { key: 'f0', type: 'text', value: 'jane@example.com' },
        { key: 'f1', type: 'checkbox', value: false },
      ])})`,
    );
  });
});
