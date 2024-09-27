import { Loading } from "~/components/loading/Loading";
import { RepositoriesTableControlBarPlaceholder } from "~/features/repositories/components/tables-v2/RepositoriesTableControlBarPlaceholder";

export default function LoadingPage() {
  return (
    <>
      <RepositoriesTableControlBarPlaceholder />
      <Loading isLoading component="tbody" />
    </>
  );
}
