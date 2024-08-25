import { Tabs } from "~/components/layout/Tabs";

interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

/* TODO: We should consider - at least eventually - populating the tabs based on the projects in the
   database. */
export default async function ProjectsLayout({ children }: AdminLayoutProps): Promise<JSX.Element> {
  return (
    <div className="flex flex-col gap-[15px] w-full h-full overflow-hidden">
      <Tabs
        items={[
          {
            label: "Asset Visualizations",
            path: "/projects/asset-visualizations",
            active: { leadingPath: "/projects/asset-visualizations" },
            icon: { name: "chart-scatter-bubble" },
          },
          {
            label: "nick.florin",
            path: "/projects/website",
            active: { leadingPath: "/projects/website" },
            icon: { name: "passport" },
          },
          {
            label: "ToolTrack",
            path: "/projects/tooltrack",
            active: { leadingPath: "/projects/tooltrack" },
            icon: { name: "screwdriver-wrench" },
          },
        ]}
      />
      <div className="grow max-h-full h-full overflow-y-auto flex flex-col">{children}</div>
    </div>
  );
}
