'use client';
import dynamic from 'next/dynamic';
import {
  type ForwardedRef,
  type JSX,
  type ReactNode,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { logger } from '~/internal/logger';

import * as types from '~/components//input/select/types';
import { useDataSelectOptions } from '~/components/input/select/hooks/use-data-select-options';
import { useSelectData } from '~/components/input/select/hooks/use-select-data';
import { Loading } from '~/components/loading/Loading';
import {
  type ConnectedMenuItemInstance,
  type DataMenuCustomModel,
  type DataMenuGroupProps,
  type DataMenuInstance,
  type DataMenuItemFlagProps,
  type MenuFeedbackProps,
  type MenuItemClickEvent,
  type MenuItemInstance,
  type MenuItemRenderProps,
  type MenuItemSelectionIndicator,
  omitDataMenuProps,
  pickDataMenuProps,
} from '~/components/menus';
import { type DataMenuProps } from '~/components/menus/DataMenu';
import { classNames, type ComponentProps, ifRefConnected } from '~/components/types';

import { DataSelectBase, type DataSelectBaseProps } from './DataSelectBase';

type DynamicDataMenuProps<M extends types.DataSelectModel, O extends types.DataSelectOptions<M>> = {
  readonly forwardedRef: ForwardedRef<DataMenuInstance<M, types.DataSelectMenuOptions<M, O>>>;
} & Omit<DataMenuProps<M, types.DataSelectMenuOptions<M, O>>, 'ref'>;

const DataMenu = dynamic(
  async () => {
    const { DataMenu: LoadedDataMenu } = await import('~/components/menus/DataMenu');
    return function <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>({
      forwardedRef,
      ...props
    }: DynamicDataMenuProps<M, O>) {
      return <LoadedDataMenu<M, types.DataSelectMenuOptions<M, O>> ref={forwardedRef} {...props} />;
    };
  },
  { loading: () => <Loading isLoading spinnerSize='16px' /> },
) as <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>(
  props: DynamicDataMenuProps<M, O>,
) => JSX.Element;

export interface DataSelectProps<
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
>
  extends
    Omit<DataSelectBaseProps<M, O, types.DataSelectInstance<M, O>>, 'content' | 'onChange'>,
    Pick<
      DataMenuProps<M, types.DataSelectMenuOptions<M, O>>,
      | 'boldSubstrings'
      | 'footer'
      | 'getItemIcon'
      | 'hasKeyboardInteractions'
      | 'header'
      | 'selectionIndicator'
      | 'shouldIncludeDescriptions'
      | Exclude<
          `item${string}` & keyof DataMenuProps<M, types.DataSelectMenuOptions<M, O>>,
          'itemIsSelected'
        >
      | Exclude<keyof DataMenuItemFlagProps<M>, 'itemIsSelected'>
      | keyof DataMenuGroupProps<M>
      | keyof MenuFeedbackProps
    > {
  readonly customItems?: (JSX.Element | Omit<types.DataSelectCustomMenuItem<M, O>, 'isCustom'>)[];
  readonly isContentLoading?: boolean;
  readonly isLoading?: boolean;
  readonly itemRenderer?: (
    model: types.ConnectedDataSelectModel<M, O>,
    params: MenuItemRenderProps,
  ) => ReactNode;
  readonly menuClassName?: ComponentProps['className'];
  readonly onChange?: types.SelectChangeHandler<
    { model: M; options: O },
    { item: true; modelValue: true }
  >;
  readonly onItemClick?: (
    e: MenuItemClickEvent,
    m: M,
    instance: MenuItemInstance,
    select: types.DataSelectInstance<M, O>,
  ) => void;
  readonly shouldBoldOptionsOnSearch?: boolean;
  readonly valueRenderer?: types.DataSelectValueRenderer<M, O>;
}

export const DataSelect = <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>({
  children,
  data: _data,
  isContentLoading: _propContentIsLoading,
  isDisabled,
  isInputLoading,
  isLoading: _propIsLoading,
  isLocked,
  itemRenderer,
  menuClassName,
  onItemClick,
  onSearch,
  options,
  ref,
  search,
  selectionIndicator: _selectionIndicator,
  shouldBoldOptionsOnSearch,
  valueRenderer,
  ...props
}: { readonly ref?: ForwardedRef<types.DataSelectInstance<M, O>> } & DataSelectProps<
  M,
  O
>): JSX.Element => {
  const menu = useRef<DataMenuInstance<M, types.DataSelectMenuOptions<M, O>> | null>(null);
  const base = useRef<null | types.DataSelectBaseInstance<M, O>>(null);

  const [internalContentIsLoading, setInternalContentIsLoading] = useState(false);
  const [internalIsLoading, setInternalIsLoading] = useState(false);

  const isContentLoading = (_propContentIsLoading ?? false) || internalContentIsLoading;
  const isLoading = (_propIsLoading ?? false) || internalIsLoading;

  const { getModelValue } = useDataSelectOptions<M, O>({ options });
  const { addOptimisticModel, data } = useSelectData<M, O>({
    base,
    data: _data,
  });

  const select = useMemo(
    (): types.DataSelectInstance<M, O> => ({
      addOptimisticModel,
      clear: types.ifClearable<
        (
          p?: types.SelectEventPublicArgs,
          cb?: types.SelectEventChangeHandler<
            typeof types.SelectEvents.CLEAR,
            { model: M; options: O },
            { modelValue: true }
          >,
        ) => void,
        { options: O }
      >(
        /* eslint-disable-next-line react-hooks/refs -- 'ifClearable' only gates the method on the
           select's behavior and never calls it, so the ref this closes over is not read until the
           method is invoked from an event handler. */
        (p, cb) =>
          ifRefConnected(base, b => b.clear(p, cb), {
            methodName: 'clear',
            name: 'data-select-base',
          }),
        { options },
      ),
      createMenuItemInstance: (...args) =>
        ifRefConnected(menu, m => m.createInstance(...args), {
          methodName: 'createMenuItemInstance',
          strict: true,
        }),
      createMenuItemInstanceIfNecessary: (...args) =>
        ifRefConnected(menu, m => m.createInstanceIfNecessary(...args), {
          methodName: 'createMenuItemInstanceIfNecessary',
          strict: true,
        }),
      deselect: types.ifDeselectable<
        (
          v: M | types.InferV<{ model: M; options: O }>,
          p?: types.SelectEventPublicArgs,
          cb?: types.SelectEventChangeHandler<
            typeof types.SelectEvents.DESELECT,
            { model: M; options: O },
            { modelValue: true }
          >,
        ) => void,
        { options: O }
      >(
        /* eslint-disable-next-line react-hooks/refs -- 'ifDeselectable' only gates the method on
           the select's behavior and never calls it, so the ref this closes over is not read until
           the method is invoked from an event handler. */
        (v, p, cb) =>
          ifRefConnected(base, b => b.deselect(v, p, cb), {
            methodName: 'deselect',
            name: 'data-select-base',
          }),
        { options },
      ),
      focusInput: (...args) =>
        ifRefConnected(base, b => b.focusInput(...args), {
          methodName: 'focusInput',
          name: 'data-select-base',
        }),
      getMenuItemInstance: (...args) =>
        ifRefConnected(menu, m => m.getInstance(...args), {
          methodName: 'getMenuItemInstance',
          strict: true,
        }),
      getOrCreateMenuItemInstance: (...args) =>
        ifRefConnected(menu, m => m.getOrCreateInstance(...args), {
          methodName: 'getOrCreateMenuItemInstance',
          strict: true,
        }),
      isSelected: (...args) =>
        ifRefConnected(base, b => b.isSelected(...args), {
          defaultValue: false,
          methodName: 'isSelected',
          name: 'data-select-base',
        }),
      select: (...args) =>
        ifRefConnected(base, b => b.select(...args), {
          methodName: 'select',
          name: 'data-select-base',
        }),
      setContentLoading: (v: boolean) => setInternalContentIsLoading(v),
      setInputLoading: (...args) =>
        ifRefConnected(base, b => b.setInputLoading(...args), {
          methodName: 'setInputLoading',
          name: 'data-select-base',
        }),
      setLoading: (v: boolean) => setInternalIsLoading(v),
      setOpen: (...args) =>
        ifRefConnected(base, b => b.setOpen(...args), {
          methodName: 'setOpen',
          name: 'data-select-base',
        }),
      setPopoverLoading: (...args) =>
        ifRefConnected(base, b => b.setPopoverLoading(...args), {
          methodName: 'setPopoverLoading',
          name: 'data-select-base',
        }),
      setValue: (...args) =>
        ifRefConnected(base, b => b.setValue(...args), {
          methodName: 'setValue',
          name: 'data-select-base',
        }),
      toggle: (...args) =>
        ifRefConnected(base, b => b.toggle(...args), {
          methodName: 'toggle',
          name: 'data-select-base',
        }),
    }),
    [options, addOptimisticModel],
  );

  useImperativeHandle(ref, () => select);

  const defaultSelectionIndicator =
    options.behavior === 'multi'
      ? (['checkbox', 'highlight'] as MenuItemSelectionIndicator)
      : (['highlight'] as MenuItemSelectionIndicator);

  const selectionIndicator = _selectionIndicator ?? defaultSelectionIndicator;

  return (
    <DataSelectBase<M, O>
      ref={base}
      {...omitDataMenuProps(props)}
      content={(_, { isOpen, isSelected, toggle }) =>
        // Force dynamic rendering of the DataMenu with the conditional render.
        isOpen ? (
          <DataMenu<M, O>
            {...pickDataMenuProps(props)}
            boldSubstrings={shouldBoldOptionsOnSearch ? search : undefined}
            className={classNames('h-full rounded-sm', menuClassName)}
            customItems={props.customItems?.map(item =>
              types.dataSelectCustomItemIsObject(item)
                ? ({
                    ...item,
                    onClick: item.onClick
                      ? (...args) => item.onClick?.(...args, select)
                      : undefined,
                    renderer: item.renderer
                      ? (...args) => item.renderer?.(...args, select)
                      : undefined,
                  } as DataMenuCustomModel)
                : item,
            )}
            data={data.map(m => ({
              ...m,
              onClick:
                m.onClick && base.current
                  ? (e: MenuItemClickEvent, instance: ConnectedMenuItemInstance) =>
                      m.onClick?.(e, instance, select)
                  : undefined,
            }))}
            forwardedRef={menu}
            isDisabled={isDisabled}
            isLoading={isLoading || isContentLoading}
            isLocked={isLocked}
            itemIsSelected={m => isSelected(m)}
            onItemClick={(e, m: M, instance) => {
              // toggle(m, instance);
              toggle(m, { dispatchChangeEvent: true });
              onItemClick?.(e, m, instance, select);
            }}
            onKeyboardNavigationExit={() => {
              base.current?.focusInput();
            }}
            options={{ getModelId: getModelValue }}
            selectionIndicator={selectionIndicator}
          >
            {itemRenderer ? (m, params) => itemRenderer(m, params) : undefined}
          </DataMenu>
        ) : null
      }
      data={data}
      isDisabled={isDisabled}
      isInputLoading={(isInputLoading ?? false) || isLoading}
      isLocked={isLocked}
      onChange={(v, params) => {
        if (menu.current) {
          if (params.event === types.SelectEvents.SELECT) {
            const vi = params.selected;
            const item = menu.current.getInstance(vi);
            if (item) {
              props.onChange?.(v, { ...params, item });
            } else {
              logger.warn(
                'During a select event, a corresponding menu item instance could not be ' +
                  `found for the the selected item with value '${vi}'.  The 'onChange' event ` +
                  'handler will not be called.',
                { params, value: vi },
              );
            }
          } else if (params.event === types.SelectEvents.DESELECT) {
            const vi = params.deselected;
            const item = menu.current.getInstance(vi);
            if (item) {
              props.onChange?.(v, { ...params, item });
            } else {
              logger.warn(
                'During a deselect event, a corresponding menu item instance could not be ' +
                  `found for the the deselected item with value '${vi}'.  The 'onChange' event ` +
                  'handler will not be called.',
                { params, value: vi },
              );
            }
          } else {
            props.onChange?.(v, params);
          }
        }
      }}
      onSearch={onSearch}
      options={options}
      search={search}
      valueRenderer={valueRenderer ? (v, mv) => valueRenderer(v, mv, select) : undefined}
    >
      {children}
    </DataSelectBase>
  );
};
