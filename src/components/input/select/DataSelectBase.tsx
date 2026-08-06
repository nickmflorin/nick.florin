'use client';
import {
  type ForwardedRef,
  type JSX,
  type ReactNode,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';

import { type FloatingContentRenderProps } from '~/components/floating';
import { useDataSelect } from '~/components/input/select/hooks';
import { type MultiValueRendererProps } from '~/components/input/select/MultiValueRenderer';
import * as types from '~/components/input/select/types';
import { type ComponentProps, ifRefConnected } from '~/components/types';

import { DataSelectInput } from './DataSelectInput';
import { RootSelect, type RootSelectProps } from './RootSelect';
import { type RootSelectInputInstance } from './RootSelectInput';

export interface DataSelectBaseProps<
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
  I extends types.DataSelectBaseInstance<M, O> = types.DataSelectBaseInstance<M, O>,
>
  extends
    Omit<
      RootSelectProps,
      'content' | 'inputRef' | 'isPlaceholderVisible' | 'onClear' | 'ref' | 'renderedValue'
    >,
    Pick<
      MultiValueRendererProps<M>,
      | 'badgeProps'
      | 'chipClassName'
      | 'chipSize'
      | 'getBadgeIcon'
      | 'getBadgeProps'
      | 'maximumValuesToRender'
      | 'onBadgeClose'
      | 'summarizeValue'
      | 'summarizeValueAfter'
      | 'valueSummary'
    > {
  readonly chipsCanDeselect?: types.IfDeselectable<{ model: M; options: O }, boolean>;
  readonly content?: (
    value: types.SelectNullableValue<{ model: M; options: O }>,
    select: I & Pick<FloatingContentRenderProps, 'isOpen' | 'setIsOpen'>,
  ) => JSX.Element | null;
  readonly data: types.ConnectedDataSelectModel<M, O>[];
  readonly getModelValueLabel?: (m: M) => ReactNode;
  readonly hasStrictValueLookup?: boolean;
  readonly initialValue?: types.SelectValue<{ model: M; options: O }>;
  readonly inputClassName?: ComponentProps['className'];
  readonly isClearable?: types.IfClearable<{ model: M; options: O }, boolean>;
  readonly itemValueRenderer?: (m: M) => JSX.Element;
  readonly onChange?: types.SelectChangeHandler<{ model: M; options: O }, { modelValue: true }>;
  readonly onClear?: types.IfClearable<{ model: M; options: O }, () => void>;
  readonly options: O;
  readonly popoverClassName?: ComponentProps['className'];
  readonly shouldCloseMenuOnSelect?: boolean;
  readonly shouldShowIconsInChips?: boolean;
  readonly value?: types.SelectValue<{ model: M; options: O }>;
  readonly valueRenderer?: (
    value: types.SelectValue<{ model: M; options: O }>,
    modelValue: types.DataSelectModelValue<M, O>,
    select: I,
  ) => ReactNode;
}

export const DataSelectBase = <
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
>({
  children,
  chipsCanDeselect: _chipsCanDeselect,
  content,
  data,
  getBadgeIcon,
  getModelValueLabel,
  hasStrictValueLookup = true,
  initialValue,
  inputClassName,
  isClearable,
  isInPortal,
  isInputLoading,
  isPopoverLoading,
  isReady,
  onChange,
  onClear: _onClear,
  onClose,
  onOpen,
  onOpenChange,
  options,
  popoverAllowedPlacements,
  popoverAutoUpdate,
  popoverClassName,
  popoverMaxHeight,
  popoverOffset,
  popoverPlacement,
  popoverWidth,
  ref,
  shouldCloseMenuOnSelect,
  shouldShowIconsInChips = true,
  value: _propValue,
  ...props
}: {
  readonly ref?: ForwardedRef<types.DataSelectBaseInstance<M, O>>;
} & DataSelectBaseProps<M, O>): JSX.Element => {
  const selectRef = useRef<null | types.RootSelectInstance>(null);
  const inputRef = useRef<null | RootSelectInputInstance>(null);

  const { clear, value, ...managed } = useDataSelect<M, O>({
    /* eslint-disable-next-line camelcase -- The underscores intentionally mark this as an
       internal, non-public prop. */
    __private_controlled_value__: _propValue,
    data,
    hasStrictValueLookup,
    initialValue,
    isReady,
    onChange,
    onSelect: () => {
      if (
        shouldCloseMenuOnSelect ||
        (shouldCloseMenuOnSelect === undefined &&
          options.behavior !== types.SelectBehaviorTypes.MULTI)
      ) {
        selectRef.current?.setOpen(false);
      }
    },
    options,
  });

  const selectInstance = useMemo(
    (): types.DataSelectBaseInstance<M, O> => ({
      ...managed,
      clear,
      focusInput: () => ifRefConnected(inputRef, i => i.focus()),
      setInputLoading: (v: boolean) => ifRefConnected(inputRef, i => i.setLoading(v)),
      setOpen: (v: boolean) => ifRefConnected(selectRef, s => s.setOpen(v)),
      setPopoverLoading: (v: boolean) =>
        ifRefConnected(selectRef, s => s.setPopoverLoading(v), {
          methodName: 'setPopoverLoading',
        }),
    }),
    [managed, clear],
  );

  useImperativeHandle(ref, () => selectInstance);

  const defaultChipsCanDeselect = options.behavior === types.SelectBehaviorTypes.MULTI;
  const chipsCanDeselect = _chipsCanDeselect ?? defaultChipsCanDeselect;

  /* While the select's data is still loading, the not-ready state must not make the select
     inert: the trigger stays clickable and the popover can open, showing the menu's loading
     indicator until the data arrives. The hard gates below are preserved for not-ready states
     that carry no loading signal, where opening would present an empty menu with no
     explanation. */
  const isAwaitingData = isReady === false && isInputLoading === true;

  const onClear = useMemo(() => {
    if ((_onClear || isClearable) && value !== types.NOTSET) {
      return () => {
        _onClear?.();
        clear({ dispatchChangeEvent: true });
      };
    }
    return undefined;
  }, [isClearable, value, _onClear, clear]);

  return (
    <RootSelect
      content={p => {
        if (value !== types.NOTSET && content !== undefined) {
          return content(value, {
            ...p,
            ...selectInstance,
            clear,
          });
        }
        return null;
      }}
      isInPortal={isInPortal}
      isInputLoading={isInputLoading}
      isPopoverLoading={isPopoverLoading}
      isReady={isAwaitingData ? true : isReady}
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
      ref={selectRef}
    >
      {children ??
        (({ isOpen, params, ref: _ref }) => (
          <DataSelectInput<M, O>
            {...params}
            {...props}
            className={inputClassName}
            getBadgeIcon={shouldShowIconsInChips ? getBadgeIcon : undefined}
            getItemLabel={getModelValueLabel}
            isDisabled={
              (props.isDisabled ?? false) ||
              (managed.modelValue === types.NOTSET && !isAwaitingData)
            }
            isLoading={isInputLoading}
            isOpen={isOpen}
            modelValue={managed.modelValue}
            onBadgeClose={
              chipsCanDeselect
                ? (m: M) => {
                    managed.deselect(m, { dispatchChangeEvent: true });
                  }
                : undefined
            }
            onClear={types.ifClearable(onClear, { options })}
            options={options}
            ref={instance => {
              if (instance) {
                _ref(instance);
                inputRef.current = instance;
              }
            }}
            value={value}
            valueRenderer={
              props.valueRenderer
                ? (v, mv) => props.valueRenderer?.(v, mv, selectInstance)
                : undefined
            }
          />
        ))}
    </RootSelect>
  );
};
