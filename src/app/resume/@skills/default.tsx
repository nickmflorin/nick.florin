import dynamic from "next/dynamic";
import { Suspense } from "react";

const SkillsBarChart = dynamic(() => import("~/components/charts/SkillsBarChart/index"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function SkillsDefault() {
  return (
    <Suspense>
      <SkillsBarChart className="w-full h-[400px]" />
    </Suspense>
  );
}
