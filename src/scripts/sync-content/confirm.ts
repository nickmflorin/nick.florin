import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

/**
 * Asks the operator to approve the rendered change set, returning whether they did.
 *
 * This is the only place the tooling blocks on human input, and it is called with no transaction
 * open by design: waiting on an answer while holding row locks would keep them for as long as the
 * terminal sits unattended.
 */
export const confirm = async (question: string): Promise<boolean> => {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const answer = await rl.question(`${question} [y/N] `);
    return ['y', 'yes'].includes(answer.trim().toLowerCase());
  } finally {
    rl.close();
  }
};
