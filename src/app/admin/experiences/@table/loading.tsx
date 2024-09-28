import { Loading } from "~/components/loading/Loading";
import { ExperiencesTableControlBarPlaceholder } from "~/features/experiences/components/tables/ExperiencesTableControlBarPlaceholder";

export default function LoadingPage() {
  return (
    <>
      <ExperiencesTableControlBarPlaceholder />
      <Loading isLoading component="tbody" />
    </>
  );
}
