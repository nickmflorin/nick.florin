import { Loading } from '~/components/loading/Loading';
import { ProjectsTableControlBarPlaceholder } from '~/features/projects/components/tables/ProjectsTableControlBarPlaceholder';

const LoadingPage = () => (
  <>
    <ProjectsTableControlBarPlaceholder />
    <Loading component='tbody' isLoading />
  </>
);

export default LoadingPage;
