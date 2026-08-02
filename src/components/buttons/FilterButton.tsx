import { type Ref, useState } from 'react';

import { type Optional } from 'utility-types';

import { type IconName, type IconProp } from '~/components/icons';
import { Icon } from '~/components/icons/Icon';
import { type ComponentProps, classNames as cs } from '~/components/types';

import { IconButton, type IconButtonProps } from './generic';

export type FilterButtonInstance = {
  readonly clear: () => void;
  readonly setValue: (v: boolean | null) => void;
} & HTMLButtonElement;

type FilterButtonState = 'false' | 'null' | 'true';
type FilterButtonStateMap<T> = Optional<Record<FilterButtonState, T>, 'null'>;

export interface FilterButtonProps extends Omit<
  IconButtonProps<'button'>,
  'icon' | 'ref' | 'scheme' | 'variant'
> {
  readonly classNames?: Partial<FilterButtonStateMap<ComponentProps['className']>>;
  readonly icons: FilterButtonStateMap<IconName | IconProp>;
  readonly initialValue: boolean | null;
  readonly onChange?: (v: boolean | null) => void;
  readonly ref?: Ref<FilterButtonInstance>;
}

export const FilterButton = ({
  classNames,
  icons,
  initialValue,
  onChange,
  ref,
  ...props
}: FilterButtonProps) => {
  const [value, setValue] = useState<boolean | null>(initialValue);

  return (
    <IconButton.Transparent
      {...props}
      className={cs('text-disabled', props.className, {
        [cs('text-blue-800', classNames?.false ?? '')]: value === false,
        [cs('text-blue-800', classNames?.true ?? '')]: value === true,
        [cs('text-disabled', classNames?.null ?? '')]: value === null,
      })}
      icon={
        <>
          <Icon
            className={cs('text-disabled', classNames?.null ?? '', { hidden: value !== null })}
            icon={icons.null ?? icons.true}
          />
          <Icon
            className={cs('text-blue-800', classNames?.true ?? '', { hidden: value !== true })}
            icon={icons.true}
          />
          <Icon
            className={cs('text-blue-800', classNames?.false ?? '', { hidden: value !== false })}
            icon={icons.false}
          />
        </>
      }
      onClick={e => {
        props.onClick?.(e);
        setValue(curr => (curr === false ? null : curr !== true));
        onChange?.(value === null ? true : value === false ? null : false);
      }}
      ref={instance => {
        if (instance) {
          if (typeof ref === 'function') {
            ref(
              Object.assign(instance, {
                clear: () => setValue(null),
                setValue: (v: boolean | null) => setValue(v),
              }),
            );
          } else if (ref) {
            ref.current = Object.assign(instance, {
              clear: () => setValue(null),
              setValue: (v: boolean | null) => setValue(v),
            });
          }
        }
      }}
      scheme='light'
    />
  );
};
