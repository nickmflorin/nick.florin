import dynamic from "next/dynamic";

import { Loading } from "~/components/views/Loading";

const EducationTimeline = dynamic(() => import("~/components/timelines/EducationTimeline"), {
  ssr: false,
  loading: () => <Loading loading={true} />,
});

export default function EducationPage() {
  return <EducationTimeline />;
}
