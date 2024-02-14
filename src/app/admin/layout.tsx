import { SideNav } from "~/components/layout/SideNav";

interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps): Promise<JSX.Element> {
  return (
    <div className="flex flex-row gap-[15px] w-full h-full overflow-hidden">
      <SideNav
        button="secondary"
        items={[
          { label: "Skills", path: "/admin/skills", active: { leadingPath: "/admin/skills" } },
          {
            label: "Experiences",
            path: "/admin/experiences",
            active: { leadingPath: "/admin/experience" },
          },
          {
            label: "Educations",
            path: "/admin/educations",
            active: { leadingPath: "/admin/educations" },
          },
        ]}
      />
      <div className="grow max-h-full overflow-hidden flex flex-col">{children}</div>
    </div>
  );
}
