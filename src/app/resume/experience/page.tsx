import { Suspense } from "react";

import { Loading } from "~/components/feedback/Loading";
import { ExperienceTimeline } from "~/components/timelines/ExperienceTimeline";

export default function ExperiencePage() {
  return (
    <Suspense fallback={<Loading isLoading={true} />}>
      <ExperienceTimeline />
    </Suspense>
  );
}
