import { PAGE_SIZES } from '~/actions';

import { ConnectedDataTableBodySkeleton } from '~/components/tables/data-tables/ConnectedDataTableBodySkeleton';
import { ExperiencesTableControlBarPlaceholder } from '~/features/experiences/components/tables/ExperiencesTableControlBarPlaceholder';

const LoadingPage = () => (
  <>
    <ExperiencesTableControlBarPlaceholder />
    <ConnectedDataTableBodySkeleton numRows={PAGE_SIZES.experience} />
  </>
);

export default LoadingPage;
