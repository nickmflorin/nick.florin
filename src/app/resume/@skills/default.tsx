import dynamic from "next/dynamic";

import { Loading } from "~/components/views/Loading";

const SkillsBarChart = dynamic(() => import("~/components/charts/SkillsBarChart/index"), {
  ssr: false,
  loading: () => <Loading loading={true} />,
});

export default function SkillsDefault() {
  return <SkillsBarChart className="w-full h-[400px]" />;
}
