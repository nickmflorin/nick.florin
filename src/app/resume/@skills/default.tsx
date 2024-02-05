import dynamic from "next/dynamic";

const SkillsBarChart = dynamic(() => import("~/components/charts/SkillsBarChart/index"), {
  ssr: true,
  loading: () => <div>Loading...</div>,
});

export default function SkillsDefault() {
  return <SkillsBarChart className="w-full h-[400px]" />;
}
