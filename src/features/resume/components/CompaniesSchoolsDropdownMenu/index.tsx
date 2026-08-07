import { Suspense } from 'react';

import { Loading } from '~/components/loading/Loading';

import { CompaniesSchoolsMenu } from './CompaniesSchoolsMenu';
import { CompaniesSchoolsMenuContent } from './CompaniesSchoolsMenuContent';
import { type ModelType } from './types';

export interface CompaniesSchoolsDropdownMenuProps {
  readonly modelType: ModelType;
}

/**
 * Renders the dropdown menu listing the companies or schools, with a footer action for creating a
 * new one.
 *
 * Nothing in the application renders this menu at present — it has no importers anywhere in
 * `src/`, so it reaches no page and is excluded from every bundle. It is kept because the surface
 * it provides, managing companies and schools from the resume pages, is still wanted, and it is
 * held to the same conventions as the menus that are live so that wiring it up is a matter of
 * importing it rather than repairing it first.
 */
export const CompaniesSchoolsDropdownMenu = ({ modelType }: CompaniesSchoolsDropdownMenuProps) => (
  <CompaniesSchoolsMenu
    content={
      <Suspense fallback={<Loading isLoading />}>
        <CompaniesSchoolsMenuContent modelType={modelType} />
      </Suspense>
    }
    modelType={modelType}
  />
);
