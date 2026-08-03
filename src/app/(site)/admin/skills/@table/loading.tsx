import { Loading } from '~/components/loading/Loading';
import { SkillsTableControlBarPlaceholder } from '~/features/skills/components/tables/SkillsTableControlBarPlaceholder';

const LoadingPage = () => (
  <>
    <SkillsTableControlBarPlaceholder />
    <Loading component='tbody' isLoading />
  </>
);

export default LoadingPage;
