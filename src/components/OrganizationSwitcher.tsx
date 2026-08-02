'use client';
import { OrganizationSwitcher as RootOrganizationSwitcher, useAuth } from '@clerk/nextjs';

/**
 * The signed-in check is performed with {@link useAuth} rather than Clerk's `<Show>` control
 * component because `<Show>` is only exported from `@clerk/nextjs` as an async server component, so
 * it cannot be used from a client component.  The hook also matches how the rest of the application
 * reads Clerk state on the client.
 */
export const OrganizationSwitcher = () => {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) {
    return null;
  }
  return (
    <RootOrganizationSwitcher
      appearance={{
        elements: {
          /* eslint-disable-next-line camelcase -- The identifier is an appearance element key
             defined by Clerk's API. */
          organizationSwitcherPopoverActionButton__createOrganization: {
            display: 'none',
          },
        },
      }}
      hidePersonal
    />
  );
};
