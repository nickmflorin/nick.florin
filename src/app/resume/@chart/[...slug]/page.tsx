import dynamic from "next/dynamic";

import { Loading } from "~/components/feedback/Loading";

const SkillsBarChart = dynamic(() => import("~/components/charts/SkillsBarChart"), {
  loading: () => <Loading isLoading={true} />,
  ssr: false,
});

export default function ChartPage() {
  return <SkillsBarChart className="w-full h-[400px]" />;
}
