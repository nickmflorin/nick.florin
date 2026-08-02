import { Suspense } from 'react';

import { Loading } from '~/components/loading/Loading';

import { CompaniesSchoolsMenuContent } from './CompaniesSchoolsMenuContent';
import { CompaniesSchoolsFloating } from './DynamicCompaniesSchoolsFloating';
import { type ModelType } from './types';

export interface CompaniesSchoolsDropdownMenuProps {
  readonly modelType: ModelType;
}

export const CompaniesSchoolsDropdownMenu = ({ modelType }: CompaniesSchoolsDropdownMenuProps) => (
  <CompaniesSchoolsFloating
    content={
      <Suspense fallback={<Loading isLoading />}>
        <CompaniesSchoolsMenuContent modelType={modelType} />
      </Suspense>
    }
    modelType={modelType}
  />
);
