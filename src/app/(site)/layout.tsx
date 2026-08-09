import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import { type ReactNode } from 'react';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { environment } from '~/environment';

import { AppConfig } from '~/components/config/AppConfig';
import { Layout } from '~/components/layout/Layout';

const InterFont = Inter({
  display: 'swap',
  style: ['normal'],
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  description: 'Personal portfolio, resume & website for Nick Florin.',
  title: environment.get('APP_NAME_FORMAL'),
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang='en'>
    <head>
      <link href='/favicon.ico' rel='icon' sizes='48x48' type='image/x-icon' />
    </head>
    <body className={InterFont.className}>
      <AppConfig>
        <Layout
          nav={[
            {
              activePaths: [{ leadingPath: '/dashboard' }],
              icon: { name: 'grid' },
              label: 'Dashboard',
              path: '/dashboard',
            },
            {
              activePaths: [
                { leadingPath: '/resume/experience' },
                { leadingPath: '/resume/education' },
              ],
              children: [
                {
                  activePaths: [{ leadingPath: '/resume/experience' }],
                  icon: { name: 'briefcase' },
                  label: 'Experience',
                  path: '/resume/experience',
                },
                {
                  activePaths: [{ leadingPath: '/resume/education' }],
                  icon: { name: 'building-columns' },
                  label: 'Education',
                  path: '/resume/education',
                },
              ],
              icon: { name: 'list-check' },
              label: 'Resume',
              path: '/resume',
            },
            {
              activePaths: [{ endPath: false, leadingPath: '/projects' }],
              icon: { name: 'hammer' },
              label: 'Projects',
              path: '/projects',
            },
            {
              href: 'https://medium.com/@nickmflorin',
              icon: { iconStyle: 'brands', name: 'medium' },
              label: 'Blog',
            },
            {
              activePaths: [
                { leadingPath: '/admin/skills' },
                { leadingPath: '/admin/experiences' },
                { leadingPath: '/admin/educations' },
                { leadingPath: '/admin/courses' },
                { leadingPath: '/admin/projects' },
                { leadingPath: '/admin/repositories' },
              ],
              icon: { name: 'gear' },
              label: 'Admin CMS',
              path: '/admin/skills',
            },
          ]}
        >
          {children}
        </Layout>
        <Analytics />
        <SpeedInsights />
      </AppConfig>
    </body>
  </html>
);

export default RootLayout;
