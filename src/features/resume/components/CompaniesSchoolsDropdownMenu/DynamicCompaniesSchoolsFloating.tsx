"use client";
import dynamic from "next/dynamic";

import { Button } from "~/components/buttons";
import { Icon } from "~/components/icons/Icon";

/* Next no longer allows 'ssr: false' with next/dynamic inside a Server Component.  The parent menu
   has to remain a Server Component, because it renders server-fetched content, so the dynamic
   import is declared here, inside a Client Component boundary. */
export const CompaniesSchoolsFloating = dynamic(() => import("./CompaniesSchoolsFloating"), {
  ssr: false,
  loading: () => (
    <Button.Solid
      isDisabled={true}
      scheme="secondary"
      icon={{
        right: <Icon icon="angle-up" size="16px" dimension="height" fit="square" />,
      }}
    >
      ...
    </Button.Solid>
  ),
});
