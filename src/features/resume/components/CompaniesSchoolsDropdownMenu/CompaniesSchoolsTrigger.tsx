import { type JSX, type Ref } from 'react';

import { Button, type ButtonProps } from '~/components/buttons/generic/Button';
import { CaretIcon } from '~/components/icons/CaretIcon';

import { type ModelType } from './types';

const TriggerLabels: Record<ModelType, string> = {
  company: 'Companies',
  school: 'Schools',
};

export interface CompaniesSchoolsTriggerProps extends Omit<
  ButtonProps<'button'>,
  'children' | 'icon' | 'ref'
> {
  readonly isOpen?: boolean;
  readonly modelType: ModelType;
  readonly ref?: Ref<HTMLButtonElement>;
}

/**
 * The button that opens the companies or schools menu.
 *
 * It is a standalone component because it is rendered from two places that must produce identical
 * markup: eagerly by {@link CompaniesSchoolsMenu} before the menu's chunk has loaded, and again by
 * {@link CompaniesSchoolsFloating} once it has, as the element the popover anchors to. Rendering
 * the same component in both keeps the swap invisible.
 */
export const CompaniesSchoolsTrigger = ({
  isOpen = false,
  modelType,
  ref,
  ...props
}: CompaniesSchoolsTriggerProps): JSX.Element => (
  <Button.Solid
    {...props}
    icon={{ right: <CaretIcon isOpen={isOpen} /> }}
    ref={ref}
    scheme='secondary'
  >
    {TriggerLabels[modelType]}
  </Button.Solid>
);
