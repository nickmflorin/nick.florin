/* eslint-disable import/order */
import { type ReactNode } from "react";
import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/nextjs";

/*
One of the breaking changes in Mantine V7 is the migration to native CSS.  The styling is no longer
done with CSS-in-JS (Emotion).

In V7, all @mantine/* packages are shipped with native CSS files which can be imported from
@mantine/{package}/styles.css or @mantine/{package}/styles.layer.css.

Some bundlers and frameworks (including Next.js) do not allow you to control the order of
stylesheets in your application when importing CSS files.  As Mantine documentation suggests, you
can mitigate this by making use of CSS layers.

Note: Importing the `styles.layer.css` files for both packages causes a style collision with the
line in the timeline component (see ~/components/timelines/CommitTimeline.tsx).  To mitigate this,
we are overriding the styles for the timeline component's line in
~/styles/globals/components/commit-timeline.scss.
*/
import "@mantine/core/styles.layer.css";
import "@mantine/dates/styles.css";

import "~/styles/globals/index.scss"; // Import this last.

import { Loading } from "~/components/loading/Loading";
import { CookiesProvider } from "./CookiesProvider";
import ClientConfig from "./ClientConfig";

export interface AppConfigProps {
  readonly children: ReactNode;
}

export const AppConfig = ({ children }: AppConfigProps): JSX.Element => (
  <ClerkProvider>
    <ClerkLoading>
      <Loading fillScreen isLoading />
    </ClerkLoading>
    <ClerkLoaded>
      <CookiesProvider>
        <ClientConfig>{children}</ClientConfig>
      </CookiesProvider>
    </ClerkLoaded>
  </ClerkProvider>
);
