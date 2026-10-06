import { Script } from 'node:vm';

import { openCardScript, PageScripts } from '~/scripts/job-search/discovery/page-scripts';

/**
 * Compiles a page script the way the browser does, without running it, so that a broken escape in
 * a script's template literal fails here rather than in the page.
 */
const compile = (script: string): Script => new Script(`(${script});`);

describe('page scripts', () => {
  it.each(Object.entries(PageScripts))('compiles the %s script', (_name, script) => {
    expect(compile(script)).toBeInstanceOf(Script);
  });

  it('compiles the open-card script with quotes and punctuation in the title', () => {
    const script = openCardScript({
      company: "O'Hooli, Inc.",
      title: 'Senior "Full-Stack" Engineer – Remote ',
    });
    expect(compile(script)).toBeInstanceOf(Script);
    expect(script).toContain(
      `const want = ${JSON.stringify({
        company: "O'Hooli, Inc.",
        title: 'Senior "Full-Stack" Engineer – Remote',
      })};`,
    );
  });
});
