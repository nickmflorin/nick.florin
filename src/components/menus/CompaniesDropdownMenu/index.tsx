import dynamic from "next/dynamic";
import { Suspense } from "react";

import { Button } from "~/components/buttons";
import { Icon } from "~/components/icons/Icon";
import { Loading } from "~/components/views/Loading";

import { CompaniesMenuContent } from "./CompaniesMenuContent";

const CompaniesFloating = dynamic(() => import("./CompaniesFloating"), {
  ssr: false,
  loading: () => (
    <Button.Secondary
      isDisabled={true}
      icon={{
        right: <Icon name="angle-up" size="16px" dimension="height" fit="square" />,
      }}
    >
      Companies
    </Button.Secondary>
  ),
});

export const CompaniesDropdownMenu = () => (
  <CompaniesFloating>
    <Suspense fallback={<Loading loading={true} />}>
      <CompaniesMenuContent />
    </Suspense>
  </CompaniesFloating>
);
