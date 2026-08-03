import { type JSX, type ReactNode } from 'react';

import { ResumesAdminTab } from '~/components/layout/ResumesAdminTab';
import { TabbedContent } from '~/components/layout/TabbedContent';

interface AdminLayoutProps {
  readonly children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps): JSX.Element => (
  <TabbedContent
    className='pb-[8px]'
    extra={<ResumesAdminTab />}
    items={[
      {
        activePaths: { leadingPath: '/admin/skills' },
        icon: { name: 'palette' },
        label: 'Skills',
        path: '/admin/skills',
      },
      {
        activePaths: { leadingPath: '/admin/experiences' },
        icon: { name: 'briefcase' },
        label: 'Experiences',
        path: '/admin/experiences',
      },
      {
        activePaths: { leadingPath: '/admin/educations' },
        icon: { name: 'building-columns' },
        label: 'Educations',
        path: '/admin/educations',
      },
      {
        activePaths: { leadingPath: '/admin/projects' },
        icon: { name: 'hammer' },
        label: 'Projects',
        path: '/admin/projects',
      },
      {
        activePaths: { leadingPath: '/admin/courses' },
        icon: { name: 'backpack' },
        label: 'Courses',
        path: '/admin/courses',
      },
      {
        activePaths: { leadingPath: '/admin/repositories' },
        icon: { iconStyle: 'brands', name: 'github' },
        label: 'Repositories',
        path: '/admin/repositories',
      },
    ]}
    padding={8}
  >
    {children}
  </TabbedContent>
);

export default AdminLayout;
