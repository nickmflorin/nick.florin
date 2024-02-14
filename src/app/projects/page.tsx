import dynamic from "next/dynamic";

const AssetVisualizations = dynamic(() => import("~/components/projects/AssetVisualizations"), {
  loading: () => <p>Loading...</p>,
});

export default function ProjectsPage() {
  return (
    <div className="flex flex-col overflow-y-scroll max-h-full">
      <div className="mx-auto  max-w-[900px] flex flex-col gap-[40px] h-full">
        <AssetVisualizations />
      </div>
    </div>
  );
}
