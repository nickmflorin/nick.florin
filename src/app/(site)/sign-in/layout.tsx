import { type JSX, type ReactNode } from 'react';

import { ClerkProvider } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

interface SignInLayoutProps {
  readonly children: ReactNode;
}

/**
 * Mounts `<ClerkProvider />` for the signed-out sign-in flow.
 *
 * `SessionClerkProvider` mounts Clerk only when a session exists, and the sign-in page is the one
 * route that needs Clerk's context without one. When a session does exist, the session-scoped
 * provider is already mounted above this layout, so a second provider is not mounted here.
 */
const SignInLayout = async ({ children }: SignInLayoutProps): Promise<JSX.Element> => {
  const { userId } = await auth();
  if (userId !== null) {
    return <>{children}</>;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
};

export default SignInLayout;
