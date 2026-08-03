import { db } from '~/database/prisma';

import { convertToPlainObject } from '~/api/serialization';

import { GreenBudget } from '~/features/projects/components/pages/GreenBudget';

import { RedirectIfNotVisible } from '../RedirectIfNotVisible';

const GreenBudgetPage = async () => {
  const project = convertToPlainObject(
    await db.project.findUniqueOrThrow({
      include: { repositories: true, skills: true },
      where: { slug: 'greenbudget' },
    }),
  );
  return (
    <RedirectIfNotVisible project={project}>
      <GreenBudget project={project} />
    </RedirectIfNotVisible>
  );
};

export default GreenBudgetPage;
