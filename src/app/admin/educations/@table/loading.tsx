import { Loading } from '~/components/loading/Loading';
import { CoursesTableControlBarPlaceholder } from '~/features/courses/components/tables/CoursesTableControlBarPlaceholder';

const LoadingPage = () => (
  <>
    <CoursesTableControlBarPlaceholder />
    <Loading component='tbody' isLoading />
  </>
);

export default LoadingPage;
