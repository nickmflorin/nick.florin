import { Loading } from "~/components/loading/Loading";
import { CoursesTableControlBarPlaceholder } from "~/features/courses/components/tables-v2/CoursesTableControlBarPlaceholder";

export default function LoadingPage() {
  return (
    <>
      <CoursesTableControlBarPlaceholder />
      <Loading isLoading component="tbody" />
    </>
  );
}
