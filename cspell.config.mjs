import fs from 'fs';

/**
 * Matches all-caps AWS service acronyms, such as `AWSEC2` or `AWSCLI`, so that each one does not
 * have to be added to `dictionary.txt` individually.
 */
const AwsAcronymPattern = /\bAWS[A-Z0-9]+\b/g;

const DefaultGlobs = [
  '**/node_modules/**',
  '**/generated/**',
  '**/dist/**',
  '**/out/**',
  '**/build/**',
  '**/.next/**',
  '**/.swc/**',
  '**/.vercel/**',
  '**/coverage/**',
  'package.json',
  'pnpm-lock.yaml',
  '**/.prettierignore',
  '**/.claude/settings.json',
  '**/.claude/settings.local.json.example',
];

/**
 * Includes the glob patterns from the .prettierignore file in the cspell configuration's
 * 'ignorePaths' option.
 *
 * By default, cspell ignores files listed in the .gitignore file but does not ignore files listed
 * in the .prettierignore file.
 */
const includePrettierIgnoreGlobPatterns = async patterns => {
  const file = await fs.promises.readFile('./.prettierignore', 'utf-8');
  /* Comment and blank lines are dropped rather than passed through as patterns. A comment reaching
     'ignorePaths' is not merely inert: cspell treats the list as gitignore-style, so a leading '#'
     makes it discard the entries around it and the run silently checks zero files. */
  const prettierIgnoredPatterns = file
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));

  return prettierIgnoredPatterns.reduce((acc, path) => {
    const standardized = path.endsWith('/') ? `${path}**` : path;
    if (!acc.includes(standardized)) {
      return [...acc, standardized];
    }
    return acc;
  }, patterns);
};

const config = async () => {
  const ignorePaths = await includePrettierIgnoreGlobPatterns(DefaultGlobs);

  return {
    allowCompoundWords: true,
    dictionaries: [
      'dictionary',
      'typescript',
      'fonts',
      'filetypes',
      'bash',
      'css',
      'html',
      'node',
      'softwareTerms',
    ],
    dictionaryDefinitions: [
      {
        addWords: true,
        name: 'dictionary',
        path: './dictionary.txt',
      },
    ],
    ignorePaths,
    ignoreRandomStrings: true,
    ignoreRegExpList: [AwsAcronymPattern],
    language: 'en',
    version: '0.2',
  };
};

export default config;
