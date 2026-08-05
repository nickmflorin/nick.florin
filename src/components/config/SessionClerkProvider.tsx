import { type JSX, type ReactNode } from 'react';

import { auth } from '@clerk/nextjs/server';

export interface SessionClerkProviderProps {
  readonly children: ReactNode;
}

/**
 * The URL that a user is redirected to after signing out.
 *
 * Clerk no longer accepts `afterSignOutUrl` on `<UserButton />`; it is now applied as global
 * configuration on `<ClerkProvider />` instead.
 */
const AfterSignOutUrl = '/';

/**
 * Mounts `<ClerkProvider />` only when the request carries a signed-in Clerk session, and renders
 * its children without any Clerk context otherwise.
 *
 * Anonymous visitors — all public traffic to the resume, projects and dashboard pages — never
 * load clerk-js or any Clerk React context, which keeps Clerk entirely out of the public pages'
 * first paint and client bundle. A signed-in session gets the provider on every page, so
 * account UI (the user menu, sign-out, account management) behaves identically across the site.
 *
 * The signed-out sign-in page is the one route that needs Clerk without a session; its layout
 * mounts the provider itself for exactly that case.
 */
export const SessionClerkProvider = async ({
  children,
}: SessionClerkProviderProps): Promise<JSX.Element> => {
  const { userId } = await auth();
  if (userId === null) {
    return <>{children}</>;
  }
  /* Imported lazily rather than at module scope: a static import would place Clerk's client
     modules in every page's client graph, including the anonymous requests this component exists
     to keep Clerk out of. */
  const { ClerkProvider } = await import('@clerk/nextjs');
  return <ClerkProvider afterSignOutUrl={AfterSignOutUrl}>{children}</ClerkProvider>;
};
