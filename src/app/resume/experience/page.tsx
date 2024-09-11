import { Suspense } from "react";

import { Loading } from "~/components/feedback/Loading";
import { ExperienceTimeline } from "~/features/experiences/components/ExperienceTimeline";

export default function ExperiencePage() {
  return (
    <Suspense fallback={<Loading isLoading={true} />}>
      <ExperienceTimeline />
    </Suspense>
  );
}
