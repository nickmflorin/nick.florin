import { classNames } from '~/components/types';

import { Button, type ButtonProps } from './generic';

export type TabButtonProps<E extends 'button' | 'link'> = {
  readonly children: string;
  readonly isLoading?: boolean;
  readonly isPending?: boolean;
} & Omit<ButtonProps<E>, 'children' | 'fontWeight' | 'isLoading' | 'isLocked' | 'size' | 'variant'>;

export const TabButton = <E extends 'button' | 'link'>({
  children,
  isActive = false,
  isLoading = false,
  isPending = false,
  ...props
}: TabButtonProps<E>) => (
  <Button.Transparent<E>
    {...props}
    className={classNames(
      'rounded-none rounded-t-md relative top-[2px] max-sm:w-full',
      'border-b-[2px] text-gray-800',
      'hover:bg-neutral-100',
      {
        'border-blue-700': isActive || isPending,
        'border-transparent hover:border-gray-300': !(isActive || isPending),
        'max-sm:bg-neutral-200': isActive || isPending,
      },
      'max-sm:border-none max-sm:rounded-md max-sm:top-0',
      'max-[700px]:px-3',
      props.className,
    )}
    fontWeight='regular'
    isLoading={isPending || isLoading}
    isLocked={isActive}
    size='medium'
  >
    {children}
  </Button.Transparent>
);
