import { Loading } from '~/components/loading/Loading';
import { RepositoriesTableControlBarPlaceholder } from '~/features/repositories/components/tables/RepositoriesTableControlBarPlaceholder';

const LoadingPage = () => (
  <>
    <RepositoriesTableControlBarPlaceholder />
    <Loading component='tbody' isLoading />
  </>
);

export default LoadingPage;
