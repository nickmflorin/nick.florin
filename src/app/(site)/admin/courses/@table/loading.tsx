import { PAGE_SIZES } from '~/actions';

import { ConnectedDataTableBodySkeleton } from '~/components/tables/data-tables/ConnectedDataTableBodySkeleton';
import { CoursesTableControlBarPlaceholder } from '~/features/courses/components/tables/CoursesTableControlBarPlaceholder';

const LoadingPage = () => (
  <>
    <CoursesTableControlBarPlaceholder />
    <ConnectedDataTableBodySkeleton numRows={PAGE_SIZES.course} />
  </>
);

export default LoadingPage;
