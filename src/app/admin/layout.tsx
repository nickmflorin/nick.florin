import { ResumesAdminTab } from "~/components/layout/ResumesAdminTab";
import { TabbedContent } from "~/components/layout/TabbedContent";

interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps): Promise<JSX.Element> {
  return (
    <TabbedContent
      padding={8}
      className="pb-[8px]"
      items={[
        {
          label: "Skills",
          path: "/admin/skills",
          activePaths: { leadingPath: "/admin/skills" },
          icon: { name: "palette" },
        },
        {
          label: "Experiences",
          path: "/admin/experiences",
          icon: { name: "briefcase" },
          activePaths: { leadingPath: "/admin/experiences" },
        },
        {
          label: "Educations",
          path: "/admin/educations",
          icon: { name: "building-columns" },
          activePaths: { leadingPath: "/admin/educations" },
        },
        {
          label: "Projects",
          path: "/admin/projects",
          icon: { name: "hammer" },
          activePaths: { leadingPath: "/admin/projects" },
        },
        {
          label: "Courses",
          path: "/admin/courses",
          icon: { name: "backpack" },
          activePaths: { leadingPath: "/admin/courses" },
        },
        {
          label: "Repositories",
          path: "/admin/repositories",
          icon: { name: "github", iconStyle: "brands" },
          activePaths: { leadingPath: "/admin/repositories" },
        },
      ]}
      extra={<ResumesAdminTab />}
    >
      {children}
    </TabbedContent>
  );
}
