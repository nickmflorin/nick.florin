import React, {
  forwardRef,
  type ForwardedRef,
  useImperativeHandle,
  useMemo,
  type ReactNode,
} from "react";

import { logger } from "~/internal/logger";

import * as types from "~/components/menus";
import {
  MenuContent,
  type MenuContentProps,
  pickMenuContentProps,
} from "~/components/menus/MenuContent";

import { useKeyboardNavigation, useDataMenuItemInstances } from "./hooks";
import { MenuItemGroup } from "./MenuItemGroup";
import { ProcessedDataMenuItem } from "./ProcessedDataMenuItem";

export interface ProcessedDataMenuContentProps<
  M extends types.DataMenuModel,
  O extends types.DataMenuOptions<M>,
> extends Omit<MenuContentProps<"menu">, "children">,
    Omit<
      types.DataMenuGroupProps<M>,
      "hideEmptyGroups" | "hideGrouplessItems" | "groups" | "itemIsVisible"
    >,
    Omit<types.DataMenuItemFlagProps<M>, "itemIsVisible">,
    types.DataMenuItemSizeProps,
    types.DataMenuItemClassNameProps<types.DataMenuItemClassName<M>>,
    types.DataMenuItemAccessorProps<M> {
  readonly options: O;
  readonly boldSubstrings?: string;
  readonly selectionIndicator?: types.MenuItemSelectionIndicator;
  readonly processedData: types.DataMenuProcessedData<M>;
  readonly includeDescriptions?: boolean;
  readonly enableKeyboardInteractions?: boolean;
  readonly onItemClick?: (
    e: types.MenuItemClickEvent,
    datum: M,
    instance: types.ConnectedMenuItemInstance,
  ) => void;
  readonly onKeyboardNavigationExit?: () => void;
  readonly children?: (datum: M, params: types.MenuItemRenderProps) => ReactNode;
}

export const ProcessedDataMenuContent = forwardRef(
  <M extends types.DataMenuModel, O extends types.DataMenuOptions<M>>(
    {
      processedData,
      enableKeyboardInteractions = true,
      includeDescriptions,
      isEmpty: _isEmpty,
      hasNoResults,
      groupLabelProps,
      groupContentClassName,
      groupLabelClassName,
      groupLabelContainerClassName,
      children,
      onKeyboardNavigationExit,
      ...props
    }: ProcessedDataMenuContentProps<M, O>,
    ref: ForwardedRef<types.DataMenuContentInstance<M, O>>,
  ): JSX.Element => {
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
            ? [...acc, m.model as M | types.DataMenuCustomModel]
            : acc,
        [] as (M | types.DataMenuCustomModel)[],
      ),
      options: props.options,
    });

    const { navigatedIndex, containerRef, incrementNavigatedIndex, decrementNavigatedIndex } =
      useKeyboardNavigation({
        data: flattenedData,
        enabled: enableKeyboardInteractions,
        excludeItemFromNavigation: datum => (datum.isGroup ? true : false),
        getItemAtNavigatedIndex: (d, i) => d.find(di => !di.isGroup && di.index === i),
        onEnter: (e, _, datum) => {
          if (!datum.isGroup) {
            const model = datum.model;
            /* Keyboard Interactions are only supported for custom data menu item instances that
               are defined as a model, not a render function or a JSX element. */
            if (
              types.dataMenuModelArgIsCustomModel(model) ||
              types.dataMenuModelArgIsModel(model)
            ) {
              const instance = _refsManager.get(model);
              /* The instance should be connected at this point, since the MenuItem associated with
                 the instance would have had to be rendered in the UI if the Enter event was
                 detected when that MenuItem was navigated to. */
              if (instance && instance.isConnected) {
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
                  "Detected an Enter KeyboardEvent on a MenuItem for which an instance is not " +
                    "established!",
                  { model },
                );
              }
            }
          }
        },
        onExit: onKeyboardNavigationExit,
      });

    useImperativeHandle(ref, () => ({
      focus: () => containerRef.current?.focus(),
      incrementNavigatedIndex,
      decrementNavigatedIndex,
      getInstance: (...args) => _refsManager.get(...args),
      createInstanceIfNecessary: (...args) => _refsManager.createIfNecessary(...args),
      createInstance: <CO extends types.CreateDataMenuItemInstanceOptions>(
        k: types.DataMenuItemInstanceLookupArg<M, O>,
        opts?: CO,
      ): types.CreateDataMenuItemInstanceRT<CO> => _refsManager.create(k, opts),
      getOrCreateInstance: (...args) => _refsManager.getOrCreate(...args),
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
                key={i}
                label={datum.label}
                labelProps={groupLabelProps}
                labelClassName={groupLabelClassName}
                labelContainerClassName={groupLabelContainerClassName}
                contentClassName={groupContentClassName}
              >
                {datum.data.map((d, j) => (
                  <ProcessedDataMenuItem<M, O>
                    {...props}
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
                    datum={d}
                    includeDescription={includeDescriptions}
                    isCurrentNavigation={enableKeyboardInteractions && navigatedIndex === d.index}
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
              datum={datum}
              includeDescription={includeDescriptions}
              isCurrentNavigation={
                enableKeyboardInteractions && !datum.isGroup && navigatedIndex === datum.index
              }
            >
              {children}
            </ProcessedDataMenuItem>
          );
        })}
      </MenuContent>
    );
  },
) as {
  <M extends types.DataMenuModel, O extends types.DataMenuOptions<M>>(
    props: ProcessedDataMenuContentProps<M, O> & {
      readonly ref?: ForwardedRef<types.DataMenuContentInstance<M, O>>;
    },
  ): JSX.Element;
};
