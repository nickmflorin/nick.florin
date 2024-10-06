import React, {
  useRef,
  createRef,
  type RefObject,
  forwardRef,
  type ForwardedRef,
  useImperativeHandle,
  useMemo,
  type ReactNode,
} from "react";

import type * as types from "~/components/menus";
import {
  MenuContent,
  type MenuContentProps,
  pickMenuContentProps,
} from "~/components/menus/MenuContent";

import { useKeyboardNavigation } from "./hooks";
import { ProcessedDataMenuItem } from "./ProcessedDataMenuItem";

type MenuItemRefs = { [key in number]: RefObject<types.MenuItemInstance> };

export interface ProcessedDataMenuContentProps<M extends types.DataMenuModel>
  extends Omit<MenuContentProps<"menu">, "children">,
    Omit<
      types.DataMenuGroupProps<M>,
      "hideEmptyGroups" | "hideGrouplessItems" | "groups" | "itemIsVisible"
    >,
    Omit<types.DataMenuItemFlagProps<M>, "itemIsVisible">,
    types.DataMenuItemClassNameProps<M>,
    types.DataMenuItemAccessorProps<M> {
  readonly boldSubstrings?: string;
  readonly selectionIndicator?: types.MenuItemSelectionIndicator;
  readonly processedData: types.DataMenuProcessedData<M>;
  readonly includeDescriptions?: boolean;
  readonly enableKeyboardInteractions?: boolean;
  readonly onItemClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | KeyboardEvent,
    datum: M,
    instance: types.MenuItemInstance,
  ) => void;
  readonly onKeyboardNavigationExit?: () => void;
  readonly children?: (datum: M, params: types.MenuItemRenderProps) => ReactNode;
}

export const ProcessedDataMenuContent = forwardRef(
  <M extends types.DataMenuModel>(
    {
      processedData,
      enableKeyboardInteractions = true,
      includeDescriptions,
      isEmpty: _isEmpty,
      hasNoResults,
      children,
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
            if (datum.isCustom) {
              /* Keyboard Interactions are only supported for custom data menu item instances that
                 are defined as a model, not a render function or a JSX element. */
              const model = datum.model;
              if (
                typeof model === "object" &&
                model !== null &&
                "onClick" in model &&
                typeof model.onClick === "function"
              ) {
                return model.onClick(e, menuItemRef.current);
              }
              return;
            }
            return props.onItemClick?.(e, datum.model, menuItemRef.current);
          }
        },
        onExit: onKeyboardNavigationExit,
      });

    useImperativeHandle(ref, () => ({
      focus: () => containerRef.current?.focus(),
      incrementNavigatedIndex,
      decrementNavigatedIndex,
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
          let itemRef: RefObject<types.MenuItemInstance> | undefined = undefined;
          if (!datum.isGroup) {
            if (menuItemRefs.current[datum.index] === undefined) {
              itemRef = createRef<types.MenuItemInstance>();
              menuItemRefs.current[datum.index] = itemRef;
            } else {
              itemRef = menuItemRefs.current[datum.index];
            }
          }
          return (
            <ProcessedDataMenuItem
              {...props}
              key={i}
              ref={itemRef}
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
  <M extends types.DataMenuModel>(
    props: ProcessedDataMenuContentProps<M> & {
      readonly ref?: ForwardedRef<types.DataMenuContentInstance>;
    },
  ): JSX.Element;
};
