import dynamic from "next/dynamic";
import { Suspense } from "react";

import { Button } from "~/components/buttons";
import { Loading } from "~/components/feedback/Loading";
import { Icon } from "~/components/icons/Icon";

import { CompaniesSchoolsMenuContent } from "./CompaniesSchoolsMenuContent";
import { type ModelType } from "./types";

const CompaniesSchoolsFloating = dynamic(() => import("./CompaniesSchoolsFloating"), {
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

export interface CompaniesSchoolsDropdownMenuProps {
  readonly modelType: ModelType;
}

export const CompaniesSchoolsDropdownMenu = ({ modelType }: CompaniesSchoolsDropdownMenuProps) => (
  <CompaniesSchoolsFloating
    modelType={modelType}
    content={
      <Suspense fallback={<Loading isLoading={true} />}>
        <CompaniesSchoolsMenuContent modelType={modelType} />
      </Suspense>
    }
  />
);
