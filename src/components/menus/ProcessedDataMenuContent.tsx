import React, {
  useRef,
  createRef,
  type RefObject,
  forwardRef,
  type ForwardedRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";

import type * as types from "~/components/menus";
import {
  MenuContent,
  type MenuContentProps,
  pickMenuContentProps,
  omitMenuContentProps,
} from "~/components/menus/MenuContent";

import { DataMenuItem } from "./DataMenuItem";
import { useKeyboardNavigation } from "./hooks";
import { MenuItemGroup } from "./MenuItemGroup";

type MenuItemRefs = { [key in number]: RefObject<types.MenuItemInstance> };

export interface ProcessedDataMenuContentProps<M extends types.DataMenuModel>
  extends Omit<MenuContentProps<"menu">, "children">,
    Omit<
      types.DataMenuGroupProps<M>,
      "hideEmptyGroups" | "hideGrouplessItems" | "groups" | "itemIsVisible"
    >,
    Omit<types.MenuItemFlagProps<M>, "itemIsVisible">,
    types.DataMenuItemCharacteristicsProps<M> {
  readonly selectionIndicator?: types.MenuItemSelectionIndicator;
  readonly processedData: types.DataMenuProcessedData<M>;
  readonly includeDescriptions?: boolean;
  readonly enableKeyboardInteractions?: boolean;
  readonly onKeyboardNavigationExit?: () => void;
  readonly children?: (datum: M, params: types.MenuItemRenderProps) => ReactNode;
}

export const ProcessedDataMenuContent = forwardRef(
  <M extends types.DataMenuModel>(
    {
      processedData,
      enableKeyboardInteractions = true,
      groupContentClassName,
      groupLabelClassName,
      groupLabelContainerClassName,
      groupLabelProps,
      includeDescriptions,
      isEmpty: _isEmpty,
      hasNoResults,
      children,
      onItemClick,
      getItemId,
      onKeyboardNavigationExit,
      ...props
    }: ProcessedDataMenuContentProps<M>,
    ref: ForwardedRef<types.DataMenuContentInstance>,
  ): JSX.Element => {
    const menuItemRefs = useRef<MenuItemRefs>({});

    const flattenedData = processedData.reduce((data: types.DataMenuProcessedData<M>, datum) => {
      if (datum.isGroup) {
        return [...data, ...datum.data];
      }
      return [...data, datum];
    }, [] as types.DataMenuProcessedData<M>);

    const { navigatedIndex, containerRef, incrementNavigatedIndex, decrementNavigatedIndex } =
      useKeyboardNavigation({
        data: flattenedData,
        enabled: enableKeyboardInteractions,
        excludeItemFromNavigation: datum => (datum.isGroup ? true : false),
        getItemAtNavigatedIndex: (d, i) => d.find(di => !di.isGroup && di.index === i),
        onEnter: (e, index, datum) => {
          const menuItemRef = menuItemRefs.current[index];
          if (menuItemRef && menuItemRef.current && !datum.isGroup) {
            onItemClick?.(e, datum.model, menuItemRef.current);
          }
        },
        onExit: onKeyboardNavigationExit,
      });

    useImperativeHandle(ref, () => ({
      focus: () => containerRef.current?.focus(),
      incrementNavigatedIndex,
      decrementNavigatedIndex,
    }));

    const renderItem = useCallback(
      (model: M, index: number) => {
        const id = getItemId?.(model) ?? model.id ?? `menu-item-${index}`;

        let itemRef: RefObject<types.MenuItemInstance>;
        if (menuItemRefs.current[index] === undefined) {
          itemRef = createRef<types.MenuItemInstance>();
          menuItemRefs.current[index] = itemRef;
        } else {
          itemRef = menuItemRefs.current[index];
        }
        return (
          <DataMenuItem<M>
            {...omitMenuContentProps(props)}
            ref={itemRef}
            id={id}
            datum={model}
            includeDescription={includeDescriptions}
            isCurrentNavigation={enableKeyboardInteractions && navigatedIndex === index}
            onItemClick={(e, instance) => onItemClick?.(e, model, instance)}
          >
            {children}
          </DataMenuItem>
        );
      },
      [
        props,
        includeDescriptions,
        enableKeyboardInteractions,
        navigatedIndex,
        onItemClick,
        children,
        getItemId,
      ],
    );

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
                label={datum.label}
                key={i}
                labelProps={groupLabelProps}
                labelClassName={groupLabelClassName}
                labelContainerClassName={groupLabelContainerClassName}
                contentClassName={groupContentClassName}
              >
                {datum.data.map(({ model, index }) => (
                  <React.Fragment key={index}>{renderItem(model, index)}</React.Fragment>
                ))}
              </MenuItemGroup>
            );
          }
          return (
            <React.Fragment key={datum.index}>
              {renderItem(datum.model, datum.index)}
            </React.Fragment>
          );
        })}
      </MenuContent>
    );
  },
) as {
  <M extends types.DataMenuModel>(
    props: ProcessedDataMenuContentProps<M> & {
      readonly ref?: ForwardedRef<types.DataMenuContentInstance>;
    },
  ): JSX.Element;
};
