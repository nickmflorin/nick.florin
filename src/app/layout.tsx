import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";

import { AppConfig } from "~/app/config/AppConfig";
import { Layout } from "~/components/layout/Layout";
import { Text } from "~/components/typography/Text";
import { ShowHide } from "~/components/util";
import { ScreenLoading } from "~/components/views/ScreenLoading";
import { env } from "~/env.mjs";

const Toast = dynamic(() => import("~/components/notifications/Toast"));

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
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css"
        />
        <Script
          type="text/javascript"
          src={`https://kit.fontawesome.com/${env.FONT_AWESOME_KIT_TOKEN}.js`}
          crossOrigin="anonymous"
          /* Using "nest" instead of "replace" avoids errors related to
             NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is
             not a child of this node */
          data-auto-replace-svg="nest"
          strategy="beforeInteractive"
        />
      </head>
      <body className={InterFont.className}>
        <AppConfig>
          <Suspense fallback={<ScreenLoading />}>
            <Layout
              nav={[
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
                      path: "/resume/experience",
                      active: [{ leadingPath: "/resume/experience" }],
                    },
                    {
                      tooltipLabel: "Education",
                      icon: { name: "building-columns" },
                      path: "/resume/education",
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
                  path: "/admin/skills",
                  active: [
                    { leadingPath: "/admin/skills" },
                    { leadingPath: "/admin/experiences" },
                    { leadingPath: "/admin/educations" },
                  ],
                },
              ]}
            >
              {children}
            </Layout>
          </Suspense>
          <ShowHide show={env.NEXT_PUBLIC_WELCOME_TOAST !== false}>
            <Toast type="info" autoClose={false}>
              <div className="flex flex-col gap-[6px] min-w-[200px]">
                <Text size="md">
                  Welcome to my personal portfolio/website! Feel free to take a look around.
                </Text>
                <Text size="sm" className="text-gray-600">
                  Note: This website is only 3 weeks old and is currently under construction.
                </Text>
              </div>
            </Toast>
          </ShowHide>
        </AppConfig>
      </body>
    </html>
  );
}
