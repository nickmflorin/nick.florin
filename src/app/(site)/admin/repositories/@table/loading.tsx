import { PAGE_SIZES } from '~/actions';

import { ConnectedDataTableBodySkeleton } from '~/components/tables/data-tables/ConnectedDataTableBodySkeleton';
import { RepositoriesTableControlBarPlaceholder } from '~/features/repositories/components/tables/RepositoriesTableControlBarPlaceholder';

const LoadingPage = () => (
  <>
    <RepositoriesTableControlBarPlaceholder />
    <ConnectedDataTableBodySkeleton numRows={PAGE_SIZES.repository} />
  </>
);

export default LoadingPage;
