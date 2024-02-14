import dynamic from "next/dynamic";

const AssetVisualizations = dynamic(() => import("~/components/projects/AssetVisualizations"), {
  loading: () => <p>Loading...</p>,
});

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-[40px] max-w-[900px] mx-auto">
      <AssetVisualizations />
    </div>
  );
}
