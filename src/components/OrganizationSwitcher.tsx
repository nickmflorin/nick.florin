"use client";
import { OrganizationSwitcher as RootOrganizationSwitcher, SignedIn } from "@clerk/nextjs";

export const OrganizationSwitcher = () => (
  <SignedIn>
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
  </SignedIn>
);

export default OrganizationSwitcher;
