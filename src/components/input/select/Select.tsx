'use client';
import { type ForwardedRef, type JSX, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { type FloatingContentRenderProps } from '~/components/floating';
import { useSelect } from '~/components/input/select/hooks';
import * as types from '~/components/input/select/types';
import { type ComponentProps } from '~/components/types';

import { RootSelect, type RootSelectProps } from './RootSelect';
import { SelectInput } from './SelectInput';

export interface SelectProps<
  V extends types.AllowedSelectValue,
  B extends types.SelectBehaviorType,
> extends Omit<
  RootSelectProps,
  'content' | 'isPlaceholderVisible' | 'onClear' | 'ref' | 'renderedValue'
> {
  readonly behavior: B;
  readonly content?: (
    value: types.SelectNullableValue<{ behavior: B; value: V }>,
    select: Pick<FloatingContentRenderProps, 'isOpen' | 'setIsOpen'> & types.SelectInstance<V, B>,
  ) => JSX.Element;
  readonly initialValue?: types.SelectValue<{ behavior: B; value: V }>;
  readonly inputClassName?: ComponentProps['className'];
  readonly isClearable?: boolean;
  readonly isLoading?: boolean;
  readonly onChange?: types.SelectChangeHandler<{ behavior: B; value: V }>;
  readonly onClear?: types.IfClearable<{ behavior: B }, () => void>;
  readonly popoverClassName?: ComponentProps['className'];
  readonly shouldCloseMenuOnSelect?: boolean;
  readonly value?: types.SelectValue<{ behavior: B; value: V }>;
  readonly valueRenderer?: types.SelectValueRenderer<V, B>;
}

export const Select = <V extends types.AllowedSelectValue, B extends types.SelectBehaviorType>({
  behavior,
  children,
  content,
  initialValue,
  inputClassName,
  isClearable,
  isInPortal,
  isInputLoading,
  isLoading: _propIsLoading,
  isPopoverLoading,
  isReady,
  onChange,
  onClear: _onClear,
  onClose,
  onOpen,
  onOpenChange,
  popoverAllowedPlacements,
  popoverAutoUpdate,
  popoverClassName,
  popoverMaxHeight,
  popoverOffset,
  popoverPlacement,
  popoverWidth,
  ref,
  shouldCloseMenuOnSelect,
  value: _propValue,
  valueRenderer,
  ...props
}: {
  readonly ref?: ForwardedRef<types.SelectInstance<V, B>>;
} & SelectProps<V, B>): JSX.Element => {
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const isLoading = (_propIsLoading ?? false) || internalIsLoading;

  const innerRef = useRef<null | types.RootSelectInstance>(null);

  const { clear, value, ...managed } = useSelect<V, B>({
    /* eslint-disable-next-line camelcase -- The underscores intentionally mark this as an
       internal, non-public prop. */
    __private_controlled_value__: _propValue,
    behavior,
    initialValue,
    onChange: (v, p) => onChange?.(v, p),
    onSelect: () => {
      if (
        shouldCloseMenuOnSelect ||
        (shouldCloseMenuOnSelect === undefined && behavior !== types.SelectBehaviorTypes.MULTI)
      ) {
        innerRef.current?.setOpen(false);
      }
    },
  });

  const select = useMemo(
    (): types.SelectInstance<V, B> => ({
      ...managed,
      clear: types.ifClearable<types.SelectInstance<V, B>['clear'], { behavior: B }>(clear, {
        behavior,
      }),
      deselect: types.ifDeselectable(managed.deselect, { behavior }),
      focusInput: () => innerRef.current?.focusInput(),
      setInputLoading: (v: boolean) => innerRef.current?.setInputLoading(v),
      setLoading: (v: boolean) => setInternalIsLoading(v),
      setOpen: (v: boolean) => innerRef.current?.setOpen(v),
      setPopoverLoading: (v: boolean) => innerRef.current?.setPopoverLoading(v),
    }),
    [behavior, managed, clear],
  );

  useImperativeHandle(ref, () => select);

  const onClear = useMemo(() => {
    if (_onClear || isClearable) {
      return () => {
        _onClear?.();
        clear({ dispatchChangeEvent: true });
      };
    }
    return undefined;
  }, [_onClear, isClearable, clear]);

  return (
    <RootSelect
      content={p => {
        if (value !== types.NOTSET && content !== undefined) {
          return content(value, {
            ...p,
            ...select,
          });
        }
        return null;
      }}
      isInPortal={isInPortal}
      /* Do not pass 'isInputLoading' through to RootSelect: it will not have an effect, since the
         input child element is overridden below. */
      isPopoverLoading={isPopoverLoading}
      isReady={isReady}
      onClose={onClose}
      onOpen={onOpen}
      onOpenChange={onOpenChange}
      popoverAllowedPlacements={popoverAllowedPlacements}
      popoverAutoUpdate={popoverAutoUpdate}
      popoverClassName={popoverClassName}
      popoverMaxHeight={popoverMaxHeight}
      popoverOffset={popoverOffset}
      popoverPlacement={popoverPlacement}
      popoverWidth={popoverWidth}
      ref={innerRef}
    >
      {children ??
        (({ isOpen, params, ref: inputRef }) => {
          const isValueRenderable =
            value !== types.NOTSET &&
            !(behavior === types.SelectBehaviorTypes.SINGLE && value === null);
          /* This type coercion is safe because SelectValue and SelectNullableValue are the same
             when the select's behavior is not single, non-nullable and the value is not null. */
          const renderedValue = isValueRenderable
            ? valueRenderer?.(value as types.SelectValue<{ behavior: B; value: V }>, select)
            : undefined;
          return (
            <SelectInput
              {...params}
              {...props}
              className={inputClassName}
              isLoading={(isInputLoading ?? false) || isLoading}
              isOpen={isOpen}
              onClear={types.ifClearable(onClear, { behavior })}
              ref={inputRef}
              value={value}
            >
              {renderedValue}
            </SelectInput>
          );
        })}
    </RootSelect>
  );
};
