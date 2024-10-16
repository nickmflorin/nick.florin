import { Suspense } from "react";

import { Loading } from "~/components/loading/Loading";
import EducationTimeline from "~/features/educations/components/EducationTimeline";

export default function EducationPage() {
  return (
    <Suspense fallback={<Loading isLoading={true} />}>
      <EducationTimeline />
    </Suspense>
  );
}
