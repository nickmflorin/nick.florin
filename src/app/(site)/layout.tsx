import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { type ReactNode } from 'react';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { isDeviceClass, ViewportDeviceHeader, ViewportSeedWidths } from '~/application/viewport';

import { environment } from '~/environment';

import { AppConfig } from '~/components/config/AppConfig';
import { Layout } from '~/components/layout/Layout';

/**
 * Resolves the viewport width that server rendering should assume for the current request, from
 * the device class the middleware inferred from the User-Agent. An absent or unrecognized header
 * value is treated as a desktop request.
 */
const getInitialViewportWidth = async (): Promise<number> => {
  const headerStore = await headers();
  const deviceHeader = headerStore.get(ViewportDeviceHeader);
  return ViewportSeedWidths[isDeviceClass(deviceHeader) ? deviceHeader : 'desktop'];
};

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

const RootLayout = async ({ children }: RootLayoutProps) => (
  <html lang='en'>
    <head>
      <link href='/favicon.ico' rel='icon' sizes='48x48' type='image/x-icon' />
    </head>
    <body className={InterFont.className}>
      <AppConfig initialViewportWidth={await getInitialViewportWidth()}>
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
