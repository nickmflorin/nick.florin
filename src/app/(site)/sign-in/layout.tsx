import { type JSX, type ReactNode } from 'react';

import { ClerkProvider } from '@clerk/nextjs';

interface SignInLayoutProps {
  readonly children: ReactNode;
}

/**
 * Mounts `<ClerkProvider />` for the sign-in flow.
 *
 * The sign-in route is the only place in the application that renders Clerk's UI, so the provider
 * is mounted here rather than above the application: every other route — the public pages and the
 * admin CMS alike — reads the session server-side and never loads clerk-js.
 */
const SignInLayout = ({ children }: SignInLayoutProps): JSX.Element => (
  <ClerkProvider>{children}</ClerkProvider>
);

export default SignInLayout;
