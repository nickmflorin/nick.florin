import { type ForwardedRef, type JSX, type ReactNode, useImperativeHandle, useMemo } from 'react';

import { logger } from '~/internal/logger';

import * as types from '~/components/menus';
import {
  MenuContent,
  type MenuContentProps,
  pickMenuContentProps,
} from '~/components/menus/MenuContent';

import { useDataMenuItemInstances, useKeyboardNavigation } from './hooks';
import { MenuItemGroup } from './MenuItemGroup';
import { ProcessedDataMenuItem } from './ProcessedDataMenuItem';

export interface ProcessedDataMenuContentProps<
  M extends types.DataMenuModel,
  O extends types.DataMenuOptions<M>,
>
  extends
    Omit<MenuContentProps<'menu'>, 'children'>,
    Omit<
      types.DataMenuGroupProps<M>,
      'groups' | 'hideEmptyGroups' | 'hideGrouplessItems' | 'itemIsVisible'
    >,
    Omit<types.DataMenuItemFlagProps<M>, 'itemIsVisible'>,
    types.DataMenuItemSizeProps,
    types.DataMenuItemClassNameProps<types.DataMenuItemClassName<M>>,
    types.DataMenuItemAccessorProps<M> {
  readonly boldSubstrings?: string;
  readonly children?: (datum: M, params: types.MenuItemRenderProps) => ReactNode;
  readonly hasKeyboardInteractions?: boolean;
  readonly onItemClick?: (
    e: types.MenuItemClickEvent,
    datum: M,
    instance: types.ConnectedMenuItemInstance,
  ) => void;
  readonly onKeyboardNavigationExit?: () => void;
  readonly options: O;
  readonly processedData: types.DataMenuProcessedData<M>;
  readonly selectionIndicator?: types.MenuItemSelectionIndicator;
  readonly shouldIncludeDescriptions?: boolean;
}

export const ProcessedDataMenuContent = <
  M extends types.DataMenuModel,
  O extends types.DataMenuOptions<M>,
>({
  children,
  groupContentClassName,
  groupLabelClassName,
  groupLabelContainerClassName,
  groupLabelProps,
  hasKeyboardInteractions = true,
  hasNoResults,
  isEmpty: _isEmpty,
  onKeyboardNavigationExit,
  processedData,
  ref,
  shouldIncludeDescriptions,
  ...props
}: {
  readonly ref?: ForwardedRef<types.DataMenuContentInstance<M, O>>;
} & ProcessedDataMenuContentProps<M, O>): JSX.Element => {
  const flattenedData = processedData.reduce(
    (
      data: types.DataMenuFlattenedProcessedData<M>,
      datum,
    ): types.DataMenuFlattenedProcessedData<M> => {
      if (datum.isGroup) {
        return [...data, ...datum.data];
      }
      return [...data, datum];
    },
    [] as types.DataMenuFlattenedProcessedData<M>,
  );

  const _refsManager = useDataMenuItemInstances<M, O>({
    data: flattenedData.reduce(
      (acc, m) =>
        types.dataMenuModelArgIsCustomModel(m.model) || types.dataMenuModelArgIsModel(m.model)
          ? [...acc, m.model]
          : acc,
      [] as (M | types.DataMenuCustomModel)[],
    ),
    options: props.options,
  });

  const { containerRef, decrementNavigatedIndex, incrementNavigatedIndex, navigatedIndex } =
    useKeyboardNavigation({
      data: flattenedData,
      enabled: hasKeyboardInteractions,
      getItemAtNavigatedIndex: (d, i) => d.find(di => di.index === i),
      onEnter: (e, _, datum) => {
        const model = datum.model;
        /* Keyboard Interactions are only supported for custom data menu item instances that
           are defined as a model, not a render function or a JSX element. */
        if (types.dataMenuModelArgIsCustomModel(model) || types.dataMenuModelArgIsModel(model)) {
          const instance = _refsManager.get(model);
          /* The instance should be connected at this point, since the MenuItem associated with
             the instance would have had to be rendered in the UI if the Enter event was
             detected when that MenuItem was navigated to. */
          if (instance?.isConnected) {
            model.onClick?.(e, instance);
            if (!model.isCustom) {
              return props.onItemClick?.(e, model, instance);
            }
          } else if (instance) {
            logger.warn(
              "Detected an Enter KeyboardEvent on a MenuItem who's instance is not connected!",
              { model },
            );
          } else {
            logger.warn(
              'Detected an Enter KeyboardEvent on a MenuItem for which an instance is not ' +
                'established!',
              { model },
            );
          }
        }
      },
      onExit: onKeyboardNavigationExit,
    });

  useImperativeHandle(ref, () => ({
    createInstance: <CO extends types.CreateDataMenuItemInstanceOptions>(
      k: types.DataMenuItemInstanceLookupArg<M, O>,
      opts?: CO,
    ): types.CreateDataMenuItemInstanceRT<CO> => _refsManager.create(k, opts),
    createInstanceIfNecessary: (...args) => _refsManager.createIfNecessary(...args),
    decrementNavigatedIndex,
    focus: () => containerRef.current?.focus(),
    getInstance: (...args) => _refsManager.get(...args),
    getOrCreateInstance: (...args) => _refsManager.getOrCreate(...args),
    incrementNavigatedIndex,
  }));

  const isEmpty = useMemo(() => {
    if (_isEmpty !== undefined) {
      return _isEmpty;
    } else if (hasNoResults) {
      return false;
    }
    const flattened = processedData.reduce((data: types.DataMenuProcessedData<M>, datum) => {
      if (datum.isGroup) {
        return [...data, ...datum.data];
      }
      return [...data, datum];
    }, [] as types.DataMenuProcessedData<M>);
    return flattened.length === 0;
  }, [_isEmpty, hasNoResults, processedData]);

  return (
    <MenuContent {...pickMenuContentProps(props)} isEmpty={isEmpty} ref={containerRef}>
      {processedData.map((datum, i) => {
        if (datum.isGroup) {
          return (
            <MenuItemGroup
              contentClassName={groupContentClassName}
              key={i}
              label={datum.label}
              labelClassName={groupLabelClassName}
              labelContainerClassName={groupLabelContainerClassName}
              labelProps={groupLabelProps}
            >
              {datum.data.map((d, j) => (
                <ProcessedDataMenuItem<M, O>
                  {...props}
                  datum={d}
                  isCurrentNavigation={hasKeyboardInteractions && navigatedIndex === d.index}
                  isDescriptionVisible={shouldIncludeDescriptions}
                  key={`${i}-${j}`}
                  ref={instance => {
                    if (
                      instance &&
                      (types.dataMenuModelArgIsModel(d.model) ||
                        types.dataMenuModelArgIsCustomModel(d.model))
                    ) {
                      _refsManager.connect(d.model, instance);
                    }
                  }}
                >
                  {children}
                </ProcessedDataMenuItem>
              ))}
            </MenuItemGroup>
          );
        }
        return (
          <ProcessedDataMenuItem
            {...props}
            datum={datum}
            isCurrentNavigation={hasKeyboardInteractions && navigatedIndex === datum.index}
            isDescriptionVisible={shouldIncludeDescriptions}
            key={i}
            ref={instance => {
              if (
                instance &&
                (types.dataMenuModelArgIsModel(datum.model) ||
                  types.dataMenuModelArgIsCustomModel(datum.model))
              ) {
                _refsManager.connect(datum.model, instance);
              }
            }}
          >
            {children}
          </ProcessedDataMenuItem>
        );
      })}
    </MenuContent>
  );
};
