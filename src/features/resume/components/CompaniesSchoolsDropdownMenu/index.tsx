import { Suspense } from "react";

import { Loading } from "~/components/loading/Loading";

import { CompaniesSchoolsMenuContent } from "./CompaniesSchoolsMenuContent";
import { CompaniesSchoolsFloating } from "./DynamicCompaniesSchoolsFloating";
import { type ModelType } from "./types";

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
