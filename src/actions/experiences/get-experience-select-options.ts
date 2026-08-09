import 'server-only';

import { db } from '~/database/prisma';

import { getExperiencesOrdering } from '~/actions';
import { logger } from '~/internal/logger';

import { type ExperienceSelectModel } from '~/features/experiences/components/input/ExperienceSelect';

/**
 * Reads the visible experiences projected down to {@link ExperienceSelectModel}, in the same
 * order `/api/experiences` returns them, for the skills chart filter form's experience select.
 *
 * The returned promise is started by the `@chart` server page without being awaited and crosses
 * the client boundary as a prop, so it must never reject — a rejection would surface as an
 * unhandled error in whichever render happens to `use()` it. Failures are logged here and
 * resolved as `null`, which the consuming select renders as its error state.
 */
export const getExperienceSelectOptions = async (): Promise<ExperienceSelectModel[] | null> => {
  try {
    return await db.experience.findMany({
      orderBy: getExperiencesOrdering(),
      select: { company: { select: { name: true } }, id: true, shortTitle: true, title: true },
      where: { visible: true },
    });
  } catch (error) {
    logger.errorUnsafe(
      error,
      'There was an error loading the experiences for the skills chart filter select.',
    );
    return null;
  }
};
