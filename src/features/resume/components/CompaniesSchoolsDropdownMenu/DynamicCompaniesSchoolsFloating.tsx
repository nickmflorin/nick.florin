'use client';
import dynamic from 'next/dynamic';

import { Button } from '~/components/buttons';
import { Icon } from '~/components/icons/Icon';

/**
 * Next.js does not allow `ssr: false` to be passed to `next/dynamic` from within a Server
 * Component. The parent menu must remain a Server Component because it renders server-fetched
 * content, so this dynamic import is declared here instead, inside a Client Component boundary.
 */
export const CompaniesSchoolsFloating = dynamic(
  () => import('./CompaniesSchoolsFloating').then(mod => mod.CompaniesSchoolsFloating),
  {
    loading: () => (
      <Button.Solid
        icon={{
          right: <Icon dimension='height' fit='square' icon='angle-up' size='16px' />,
        }}
        isDisabled
        scheme='secondary'
      >
        ...
      </Button.Solid>
    ),
    ssr: false,
  },
);
