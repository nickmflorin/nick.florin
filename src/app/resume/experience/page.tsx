import { Suspense } from "react";

import { ExperienceTimeline } from "~/components/timelines/ExperienceTimeline";
import { Loading } from "~/components/views/Loading";

export default function ExperiencePage() {
  return (
    <Suspense fallback={<Loading loading={true} />}>
      <ExperienceTimeline />
    </Suspense>
  );
}
