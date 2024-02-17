import { Suspense } from "react";

import EducationTimeline from "~/components/timelines/EducationTimeline";
import { Loading } from "~/components/views/Loading";

export default function EducationPage() {
  return (
    <Suspense fallback={<Loading loading={true} />}>
      <EducationTimeline />
    </Suspense>
  );
}
