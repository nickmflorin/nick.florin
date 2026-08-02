'use client';

import { Button } from '~/components/buttons';
import { type DrawerId } from '~/components/drawers';
import { useDrawers } from '~/components/drawers/hooks/use-drawers';

export interface NewButtonProps {
  readonly drawerId: DrawerId;
}

export const NewButton = ({ drawerId }: NewButtonProps) => {
  const { open } = useDrawers();
  return (
    <Button.Solid onClick={() => open(drawerId, {})} scheme='primary'>
      New
    </Button.Solid>
  );
};
