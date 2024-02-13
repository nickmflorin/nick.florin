import dynamic from "next/dynamic";

const EducationTimeline = dynamic(() => import("~/components/timelines/EducationTimeline"), {
  ssr: false,
});

export default function EducationPage() {
  return <EducationTimeline />;
}
