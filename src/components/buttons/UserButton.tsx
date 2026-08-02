'use client';
import { UserButton as RootUserButton, useAuth } from '@clerk/nextjs';

/**
 * The signed-in check is performed with {@link useAuth} rather than Clerk's `<Show>` control
 * component because `<Show>` is only exported from `@clerk/nextjs` as an async server component, so
 * it cannot be used from a client component.  The hook also matches how the rest of the application
 * reads Clerk state on the client.
 */
export const UserButton = () => {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) {
    return null;
  }
  return <RootUserButton />;
};
