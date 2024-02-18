import dynamic from "next/dynamic";

import { Loading } from "~/components/views/Loading";

const AssetVisualizations = dynamic(() => import("~/components/projects/AssetVisualizations"), {
  loading: () => <Loading loading={true} />,
});

export default function ProjectsPage() {
  return (
    <div className="flex flex-col overflow-y-scroll max-h-full">
      <AssetVisualizations />
    </div>
  );
}
