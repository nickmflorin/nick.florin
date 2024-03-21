import dynamic from "next/dynamic";
import { Suspense } from "react";

import { Button } from "~/components/buttons";
import { Icon } from "~/components/icons/Icon";
import { Loading } from "~/components/views/Loading";

import { CompaniesSchoolsMenuContent } from "./CompaniesSchoolsMenuContent";
import { type ModelType } from "./types";

const CompaniesSchoolsFloating = dynamic(() => import("./CompaniesSchoolsFloating"), {
  ssr: false,
  loading: () => (
    <Button.Secondary
      isDisabled={true}
      icon={{
        right: <Icon name="angle-up" size="16px" dimension="height" fit="square" />,
      }}
    >
      ...
    </Button.Secondary>
  ),
});

export interface CompaniesSchoolsDropdownMenuProps {
  readonly modelType: ModelType;
}

export const CompaniesSchoolsDropdownMenu = ({ modelType }: CompaniesSchoolsDropdownMenuProps) => (
  <CompaniesSchoolsFloating modelType={modelType}>
    <Suspense fallback={<Loading loading={true} />}>
      <CompaniesSchoolsMenuContent modelType={modelType} />
    </Suspense>
  </CompaniesSchoolsFloating>
);
