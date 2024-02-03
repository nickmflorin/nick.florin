import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import { AppConfig } from "~/components/config/AppConfig";
import { Layout } from "~/components/layout/Layout";
import { env } from "~/env.mjs";

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
          data-auto-replace-svg="nest"
          data-mutate-approach="sync"
          data-observe-mutations
        />
      </head>
      <body className={InterFont.className}>
        <AppConfig>
          <Layout
            sidebar={[
              {
                label: "Resume",
                icon: { name: "file-user" },
                path: "/resume",
                active: [
                  { leadingPath: "/resume/experience" },
                  { leadingPath: "/resume/education" },
                ],
                children: [
                  {
                    label: "Experience",
                    icon: { name: "briefcase" },
                    path: "/resume/experience",
                    active: [{ leadingPath: "/resume/experience" }],
                  },
                  {
                    label: "Education",
                    icon: { name: "building-columns" },
                    path: "/resume/education",
                    active: [{ leadingPath: "/resume/education" }],
                  },
                ],
              },
              {
                label: "Projects",
                icon: { name: "file-user" },
                path: "/projects",
                active: [{ leadingPath: "/projects" }],
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
