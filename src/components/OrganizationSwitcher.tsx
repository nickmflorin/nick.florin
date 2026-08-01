"use client";
import { useAuth, OrganizationSwitcher as RootOrganizationSwitcher } from "@clerk/nextjs";

/* Clerk v7 removed the <SignedIn> control component.  Its replacement, <Show>, is only exported
   from '@clerk/nextjs' as an async server component, so it cannot be used from a client component.
   The signed-in check is instead done through the hook, which also matches how the rest of the
   application reads Clerk state on the client. */
export const OrganizationSwitcher = () => {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) {
    return null;
  }
  return (
    <RootOrganizationSwitcher
      hidePersonal={true}
      appearance={{
        // hide the "Create Organization" button
        elements: {
          organizationSwitcherPopoverActionButton__createOrganization: {
            display: "none",
          },
        },
      }}
    />
  );
};

export default OrganizationSwitcher;
