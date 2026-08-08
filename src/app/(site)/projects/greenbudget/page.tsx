import { getPageProject } from '~/actions/projects/get-page-project';

import { GreenBudget } from '~/features/projects/components/pages/GreenBudget';

import { RedirectIfNotVisible } from '../RedirectIfNotVisible';

const GreenBudgetPage = async () => {
  const project = await getPageProject('greenbudget');
  return (
    <RedirectIfNotVisible project={project}>
      <GreenBudget project={project} />
    </RedirectIfNotVisible>
  );
};

export default GreenBudgetPage;
