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
          path: "/admin-v2/skills",
          activePaths: { leadingPath: "/admin-v2/skills" },
          icon: { name: "palette" },
        },
        {
          label: "Experiences",
          path: "/admin-v2/experiences",
          icon: { name: "briefcase" },
          activePaths: { leadingPath: "/admin-v2/experiences" },
        },
        /* {
             label: "Educations",
             path: "/admin-v2/educations",
             icon: { name: "building-columns" },
             activePaths: { leadingPath: "/admin-v2/educations" },
           },
           {
             label: "Projects",
             path: "/admin-v2/projects",
             icon: { name: "hammer" },
             activePaths: { leadingPath: "/admin-v2/projects" },
           },
           {
             label: "Courses",
             path: "/admin-v2/courses",
             icon: { name: "backpack" },
             activePaths: { leadingPath: "/admin-v2/courses" },
           },
           {
             label: "Repositories",
             path: "/admin-v2/repositories",
             icon: { name: "github", iconStyle: "brands" },
             activePaths: { leadingPath: "/admin-v2/repositories" },
           }, */
      ]}
      extra={<ResumesAdminTab />}
    >
      {children}
    </TabbedContent>
  );
}
