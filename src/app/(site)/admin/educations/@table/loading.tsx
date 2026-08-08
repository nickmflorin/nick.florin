import { PAGE_SIZES } from '~/actions';

import { ConnectedDataTableBodySkeleton } from '~/components/tables/data-tables/ConnectedDataTableBodySkeleton';
import { EducationsTableControlBarPlaceholder } from '~/features/educations/components/tables/EducationsTableControlBarPlaceholder';

const LoadingPage = () => (
  <>
    <EducationsTableControlBarPlaceholder />
    <ConnectedDataTableBodySkeleton numRows={PAGE_SIZES.education} />
  </>
);

export default LoadingPage;
