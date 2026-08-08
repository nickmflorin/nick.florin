import { PAGE_SIZES } from '~/actions';

import { ConnectedDataTableBodySkeleton } from '~/components/tables/data-tables/ConnectedDataTableBodySkeleton';
import { ProjectsTableControlBarPlaceholder } from '~/features/projects/components/tables/ProjectsTableControlBarPlaceholder';

const LoadingPage = () => (
  <>
    <ProjectsTableControlBarPlaceholder />
    <ConnectedDataTableBodySkeleton numRows={PAGE_SIZES.project} />
  </>
);

export default LoadingPage;
