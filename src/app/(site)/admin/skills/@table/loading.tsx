import { PAGE_SIZES } from '~/actions';

import { ConnectedDataTableBodySkeleton } from '~/components/tables/data-tables/ConnectedDataTableBodySkeleton';
import { SkillsTableControlBarPlaceholder } from '~/features/skills/components/tables/SkillsTableControlBarPlaceholder';

const LoadingPage = () => (
  <>
    <SkillsTableControlBarPlaceholder />
    <ConnectedDataTableBodySkeleton numRows={PAGE_SIZES.skill} />
  </>
);

export default LoadingPage;
