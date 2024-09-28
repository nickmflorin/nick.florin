import { Loading } from "~/components/loading/Loading";
import { CoursesTableControlBarPlaceholder } from "~/features/courses/components/tables/CoursesTableControlBarPlaceholder";

export default function LoadingPage() {
  return (
    <>
      <CoursesTableControlBarPlaceholder />
      <Loading isLoading component="tbody" />
    </>
  );
}
