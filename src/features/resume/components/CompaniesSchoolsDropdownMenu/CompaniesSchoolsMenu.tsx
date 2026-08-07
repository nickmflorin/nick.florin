'use client';
/* The directive is required because Next does not allow 'ssr: false' with next/dynamic outside of
   a Client Component, and the menu below it can only render on the client. */
import dynamic from 'next/dynamic';
import { type JSX, useState } from 'react';

import { Button } from '~/components/buttons/generic/Button';
import { CaretIcon } from '~/components/icons/CaretIcon';

import { CompaniesSchoolsTrigger } from './CompaniesSchoolsTrigger';
import { type ModelType } from './types';

const loadCompaniesSchoolsFloating = () => import('./CompaniesSchoolsFloating');

const CompaniesSchoolsFloating = dynamic(
  () => loadCompaniesSchoolsFloating().then(mod => mod.CompaniesSchoolsFloating),
  {
    /* While the chunk resolves after the opening click, a disabled button holds the trigger's
       place so it never drops out of the layout. The label is elided rather than guessed, because
       the fallback cannot see which model type is being rendered. */
    loading: () => (
      <Button.Solid icon={{ right: <CaretIcon isOpen={false} /> }} isDisabled scheme='secondary'>
        ...
      </Button.Solid>
    ),
    ssr: false,
  },
);

export interface CompaniesSchoolsMenuProps {
  readonly content: JSX.Element;
  readonly modelType: ModelType;
}

/**
 * Renders the companies or schools trigger, and mounts the menu itself only once the trigger has
 * been used.
 *
 * The trigger is deliberately outside the lazily-loaded module: rendering it eagerly is what puts
 * the button in the server-rendered HTML, where previously the whole floating - trigger included -
 * sat behind `ssr: false` and popped in only after hydration and the chunk had both completed.
 * Mounting the menu with `isInitiallyOpen` means the click that mounted it also opens it, so the
 * user never has to click twice.
 */
export const CompaniesSchoolsMenu = ({
  content,
  modelType,
}: CompaniesSchoolsMenuProps): JSX.Element => {
  const [isMounted, setIsMounted] = useState(false);

  if (!isMounted) {
    return (
      <CompaniesSchoolsTrigger
        modelType={modelType}
        onClick={() => setIsMounted(true)}
        onFocus={() => void loadCompaniesSchoolsFloating()}
        onMouseEnter={() => void loadCompaniesSchoolsFloating()}
      />
    );
  }
  return <CompaniesSchoolsFloating content={content} isInitiallyOpen modelType={modelType} />;
};
