import 'server-only';

import { db } from '~/database/prisma';
import { logger } from '~/internal/logger';

import { getEducationsOrdering } from '~/actions';

import { type EducationSelectModel } from '~/features/educations/components/input/EducationSelect';

/**
 * Reads the visible educations projected down to {@link EducationSelectModel}, in the same order
 * `/api/educations` returns them, for the skills chart filter form's education select.
 *
 * The returned promise is started by the `@chart` server page without being awaited and crosses
 * the client boundary as a prop, so it must never reject — a rejection would surface as an
 * unhandled error in whichever render happens to `use()` it. Failures are logged here and
 * resolved as `null`, which the consuming select renders as its error state.
 */
export const getEducationSelectOptions = async (): Promise<EducationSelectModel[] | null> => {
  try {
    return await db.education.findMany({
      orderBy: getEducationsOrdering(),
      select: { id: true, major: true, school: { select: { name: true } }, shortMajor: true },
      where: { visible: true },
    });
  } catch (error) {
    logger.errorUnsafe(
      error,
      'There was an error loading the educations for the skills chart filter select.',
    );
    return null;
  }
};
