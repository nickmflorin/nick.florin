import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { type ReactNode } from "react";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { AppConfig } from "~/app/config/AppConfig";
import { environment } from "~/environment";
import { Layout } from "~/components/layout/Layout";

const InterFont = Inter({
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: environment.get("APP_NAME_FORMAL"),
  description: "Personal portfolio, resume & website for Nick Florin.",
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="48x48" />
        <Script
          type="text/javascript"
          src={`https://kit.fontawesome.com/${environment.get("FONT_AWESOME_KIT_TOKEN")}.js`}
          /* Using "nest" instead of "replace" avoids errors related to
             NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is
             not a child of this node */
          data-auto-replace-svg="nest"
          strategy="beforeInteractive"
        />
      </head>
      <body className={InterFont.className}>
        <AppConfig>
          <Layout
            nav={[
              {
                tooltipLabel: "Dashboard",
                icon: { name: "grid" },
                path: "/dashboard",
                active: [{ leadingPath: "/dashboard" }],
              },
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
                active: [{ leadingPath: "/projects", endPath: false }],
              },
              {
                tooltipLabel: "Blog",
                icon: { name: "medium", iconStyle: "brands" },
                href: "https://medium.com/@nickmflorin",
              },
              {
                tooltipLabel: "Admin CMS",
                icon: { name: "gear" },
                path: "/admin/skills",
                active: [
                  { leadingPath: "/admin/skills" },
                  { leadingPath: "/admin/experiences" },
                  { leadingPath: "/admin/educations" },
                  { leadingPath: "/admin/courses" },
                  { leadingPath: "/admin/projects" },
                  { leadingPath: "/admin/repositories" },
                ],
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
}
