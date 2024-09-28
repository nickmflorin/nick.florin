import { Loading } from "~/components/loading/Loading";
import { SkillsTableControlBarPlaceholder } from "~/features/skills/components/tables/SkillsTableControlBarPlaceholder";

export default function LoadingPage() {
  return (
    <>
      <SkillsTableControlBarPlaceholder />
      <Loading isLoading component="tbody" />
    </>
  );
}
