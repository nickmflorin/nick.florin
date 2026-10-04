import { readApprovedResume } from '../resume/approved-resume';
import { type Posting } from '../schemas';
import { type SessionContext } from '../session';

export const requirePosting = async ({ store }: SessionContext, id: string): Promise<Posting> => {
  const posting = await store.getPosting(id);
  if (posting === null) {
    throw new Error(`There is no posting '${id}' in the ledger.`);
  }
  return posting;
};

export const requireApprovedResume = async (dataDirectory: string) => {
  const resume = await readApprovedResume(dataDirectory);
  if (resume.status === 'missing') {
    throw new Error(
      "No resume has been approved. Nick approves one with 'pnpm cli jobs resume approve'.",
    );
  } else if (resume.status === 'mismatched') {
    throw new Error(
      'The approved resume no longer matches its approval. Nick approves one again with ' +
        "'pnpm cli jobs resume approve'.",
    );
  }
  return resume;
};
