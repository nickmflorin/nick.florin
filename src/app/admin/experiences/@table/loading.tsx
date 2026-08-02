import { Loading } from '~/components/loading/Loading';
import { ExperiencesTableControlBarPlaceholder } from '~/features/experiences/components/tables/ExperiencesTableControlBarPlaceholder';

const LoadingPage = () => (
  <>
    <ExperiencesTableControlBarPlaceholder />
    <Loading component='tbody' isLoading />
  </>
);

export default LoadingPage;
