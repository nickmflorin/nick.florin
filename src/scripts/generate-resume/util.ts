import fs from 'node:fs/promises';

export const pathExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Replaces every match of {@link pattern} in {@link value} with the result of an asynchronous
 * replacer.
 *
 * Every replacement is resolved before any of them is applied, because the native replace APIs
 * cannot await a replacer, and inlining an asset requires reading it from disk. The resolved
 * replacements line up with the matches the subsequent replace pass visits because a global
 * pattern yields the same matches, in the same order, to both passes.
 *
 * @param {string} value The string to perform the replacements on.
 * @param {RegExp} pattern
 *   The pattern to replace, which must carry the global flag so that every occurrence is matched.
 * @param {(match: RegExpExecArray) => Promise<string>} replacer
 *   Returns the text that the match it is given should be replaced with.
 *
 * @returns {Promise<string>} The string with every match replaced.
 */
export const replaceAsync = async (
  value: string,
  pattern: RegExp,
  replacer: (match: RegExpExecArray) => Promise<string>,
): Promise<string> => {
  const replacements = await Promise.all(
    [...value.matchAll(pattern)].map(match => replacer(match)),
  );

  let cursor = 0;
  return value.replace(pattern, () => {
    const replacement = replacements[cursor];
    cursor += 1;
    return replacement;
  });
};
