import dynamic from "next/dynamic";

const ExperienceTimeline = dynamic(() => import("~/components/timelines/ExperienceTimeline"), {
  ssr: false,
});

export default function ExperiencePage() {
  return <ExperienceTimeline />;
}
