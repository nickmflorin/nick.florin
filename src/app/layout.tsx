import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import Script from "next/script";

import { AppConfig } from "~/components/config/AppConfig";
import { ScreenLoading } from "~/components/views/ScreenLoading";
import { env } from "~/env.mjs";

/* Note: The reason we dynamically import the layout is because it accesses server side data to
   fetch the profile - which is only needed for the social buttons in the header.  We may want to
   instead fetch the profile data in the Header component itself, and only dynamically load the
   part of the Header component that shows the social buttons. */
const Layout = dynamic(() => import("~/components/layout/Layout"), {
  loading: () => <ScreenLoading />,
});

const InterFont = Inter({
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: env.APP_NAME_FORMAL,
  description: "Personal portfolio, resume & website for Nick Florin.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="48x48" />
        <Script
          type="text/javascript"
          src={`https://kit.fontawesome.com/${env.FONT_AWESOME_KIT_TOKEN}.js`}
          crossOrigin="anonymous"
          data-auto-replace-svg="replace"
          data-mutate-approach="sync"
          data-observe-mutations
        />
      </head>
      <body className={InterFont.className}>
        <AppConfig>
          <Layout
            sidebar={[
              {
                tooltipLabel: "Resume",
                icon: { name: "list-check" },
                path: "/resume",
                active: [
                  { leadingPath: "/resume/experience" },
                  { leadingPath: "/resume/education" },
                ],
                children: [
                  {
                    tooltipLabel: "Experience",
                    icon: { name: "briefcase" },
                    path: { pathname: "/resume/experience", maintainQuery: true },
                    active: [{ leadingPath: "/resume/experience" }],
                  },
                  {
                    tooltipLabel: "Education",
                    icon: { name: "building-columns" },
                    path: { pathname: "/resume/education", maintainQuery: true },
                    active: [{ leadingPath: "/resume/education" }],
                  },
                ],
              },
              {
                tooltipLabel: "Projects",
                icon: { name: "hammer" },
                path: "/projects",
                active: [{ leadingPath: "/projects" }],
              },
              {
                tooltipLabel: "Admin CMS",
                icon: { name: "gear" },
                path: "/admin",
                active: [{ leadingPath: "/admin" }],
              },
            ]}
          >
            {children}
          </Layout>
        </AppConfig>
      </body>
    </html>
  );
}
