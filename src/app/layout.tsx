import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import { Layout } from "~/components/layout/Layout";
import "~/styles/globals/index.scss";
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
        <Script
          type="text/javascript"
          src={`https://kit.fontawesome.com/${env.FONT_AWESOME_KIT_TOKEN}.js`}
          crossOrigin=""
          data-auto-replace-svg="nest"
          data-mutate-approach="sync"
          data-observe-mutations
        />
      </head>
      <body className={InterFont.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
