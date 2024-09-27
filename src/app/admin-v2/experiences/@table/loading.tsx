import { Loading } from "~/components/loading/Loading";
import { ExperiencesTableControlBarPlaceholder } from "~/features/experiences/components/tables-v2/ExperiencesTableControlBarPlaceholder";

export default function LoadingPage() {
  return (
    <>
      <ExperiencesTableControlBarPlaceholder />
      <Loading isLoading component="tbody" />
    </>
  );
}
