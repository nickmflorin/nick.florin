import dynamic from "next/dynamic";

import { Loading } from "~/components/views/Loading";

const ExperienceTimeline = dynamic(() => import("~/components/timelines/ExperienceTimeline"), {
  ssr: false,
  loading: () => <Loading loading={true} />,
});

export default function ExperiencePage() {
  return (
    <div className="max-h-full h-full overflow-y-scroll">
      <ExperienceTimeline />
    </div>
  );
}
