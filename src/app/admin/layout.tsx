import { Tabs } from "~/components/layout/Tabs";

interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps): Promise<JSX.Element> {
  return (
    <div className="flex flex-col gap-[15px] w-full h-full overflow-hidden">
      <Tabs
        items={[
          { label: "Skills", path: "/admin/skills", active: { leadingPath: "/admin/skills" } },
          {
            label: "Experiences",
            path: "/admin/experiences",
            active: { leadingPath: "/admin/experiences" },
          },
          {
            label: "Educations",
            path: "/admin/educations",
            active: { leadingPath: "/admin/educations" },
          },
        ]}
      />
      <div className="grow max-h-full h-full overflow-hidden flex flex-col">{children}</div>
    </div>
  );
}
