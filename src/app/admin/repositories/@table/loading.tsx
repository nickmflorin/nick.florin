import { Loading } from "~/components/loading/Loading";
import { RepositoriesTableControlBarPlaceholder } from "~/features/repositories/components/tables/RepositoriesTableControlBarPlaceholder";

export default function LoadingPage() {
  return (
    <>
      <RepositoriesTableControlBarPlaceholder />
      <Loading isLoading component="tbody" />
    </>
  );
}
