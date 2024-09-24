import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { type ReactNode } from "react";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { environment } from "~/environment";

import { AppConfig } from "~/components/config/AppConfig";
import { SidebarItemAccessTypes } from "~/components/layout";
import { Layout } from "~/components/layout/Layout";

const InterFont = Inter({
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
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
                label: "Dashboard",
                icon: { name: "grid" },
                path: "/dashboard",
                activePaths: [{ leadingPath: "/dashboard" }],
              },
              {
                label: "Resume",
                icon: { name: "list-check" },
                path: "/resume",
                activePaths: [
                  { leadingPath: "/resume/experience" },
                  { leadingPath: "/resume/education" },
                ],
                children: [
                  {
                    label: "Experience",
                    icon: { name: "briefcase" },
                    path: "/resume/experience",
                    activePaths: [{ leadingPath: "/resume/experience" }],
                  },
                  {
                    label: "Education",
                    icon: { name: "building-columns" },
                    path: "/resume/education",
                    activePaths: [{ leadingPath: "/resume/education" }],
                  },
                ],
              },
              {
                label: "Projects",
                icon: { name: "hammer" },
                path: "/projects",
                activePaths: [{ leadingPath: "/projects", endPath: false }],
              },
              {
                label: "Blog",
                icon: { name: "medium", iconStyle: "brands" },
                href: "https://medium.com/@nickmflorin",
              },
              {
                label: "Admin CMS",
                icon: { name: "gear" },
                path: "/admin/skills",
                activePaths: [
                  { leadingPath: "/admin/skills" },
                  { leadingPath: "/admin/experiences" },
                  { leadingPath: "/admin/educations" },
                  { leadingPath: "/admin/courses" },
                  { leadingPath: "/admin/projects" },
                  { leadingPath: "/admin/repositories" },
                ],
              },
              {
                label: "Admin CMS V2",
                icon: { name: "gears" },
                path: "/admin-v2/skills",
                accessType: SidebarItemAccessTypes.ADMIN,
                activePaths: [
                  { leadingPath: "/admin-v2/skills" },
                  { leadingPath: "/admin-v2/experiences" },
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
