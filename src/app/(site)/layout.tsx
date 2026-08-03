import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import { type ReactNode } from 'react';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { environment } from '~/environment';

import { AppConfig } from '~/components/config/AppConfig';
import { Layout } from '~/components/layout/Layout';

/**
 * The value applied to the font-awesome script's `data-auto-replace-svg` attribute.
 *
 * Using "nest" instead of "replace" avoids errors related to `NotFoundError: Failed to execute
 * 'removeChild' on 'Node': The node to be removed is not a child of this node`.
 */
const FontAwesomeAutoReplaceSvgStrategy = 'nest';

/**
 * Loads the FontAwesome kit script in the document head.
 *
 * Renders a plain `<script>` rather than `next/script`. The latter is a client component that
 * reads `HeadManagerContext`, which is unavailable while a route is being statically prerendered
 * under Next 16, and fails the build with "Cannot read properties of null (reading
 * 'useContext')". React 19 hoists a plain async script into the head on its own.
 */
const FontAwesomeScript = () => (
  <script
    async
    data-auto-replace-svg={FontAwesomeAutoReplaceSvgStrategy}
    src={`https://kit.fontawesome.com/${environment.get('FONT_AWESOME_KIT_TOKEN')}.js`}
    type='text/javascript'
  />
);

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
      <FontAwesomeScript />
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
