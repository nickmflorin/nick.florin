import React, {
  useRef,
  createRef,
  type RefObject,
  type ReactNode,
  forwardRef,
  type ForwardedRef,
  useImperativeHandle,
  useMemo,
  useCallback,
} from "react";

import type * as types from "~/components/menus";
import { useKeyboardNavigation } from "~/components/menus/hooks";
import { MenuContent, type MenuContentProps } from "~/components/menus/MenuContent";
import { type ComponentProps } from "~/components/types";
import { type LabelProps } from "~/components/typography";

import { DataMenuItem, type DataMenuItemProps } from "./DataMenuItem";
import { MenuItemGroup } from "./MenuItemGroup";

type MenuItemRefs = { [key in number]: RefObject<types.MenuItemInstance> };

export interface DataMenuContentProps<M extends types.DataMenuModel>
  extends Omit<MenuContentProps<"menu">, "children">,
    Pick<
      DataMenuItemProps<M>,
      | "getItemIcon"
      | "getItemDescription"
      | "itemSelectedClassName"
      | "itemNavigatedClassName"
      | "itemLockedClassName"
      | "itemLoadingClassName"
      | "itemDisabledClassName"
      | "itemIconProps"
      | "itemIconSize"
      | "itemSpinnerClassName"
      | "itemIconClassName"
      | "selectionIndicator"
      | "itemHeight"
      | "itemClassName"
      | "children"
    > {
  readonly data: M[];
  readonly includeDescriptions?: boolean;
  readonly groups?: types.DataMenuGroup<M>[];
  readonly hideEmptyGroups?: boolean;
  readonly hideGrouplessItems?: boolean;
  readonly enableKeyboardInteractions?: boolean;
  readonly groupContentClassName?: ComponentProps["className"];
  readonly groupLabelContainerClassName?: ComponentProps["className"];
  readonly groupLabelProps?: Omit<LabelProps, "className" | "children">;
  readonly groupLabelClassName?: ComponentProps["className"];
  readonly itemIsSelected: (datum: M) => boolean;
  readonly itemIsDisabled?: (datum: M) => boolean;
  readonly itemIsLoading?: (datum: M) => boolean;
  readonly itemIsVisible?: (datum: M) => boolean;
  readonly itemIsLocked?: (datum: M) => boolean;
  readonly onItemClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | KeyboardEvent,
    datum: M,
    instance: types.MenuItemInstance,
  ) => void;
  readonly getItemId?: (datum: M) => string | number | undefined;
  readonly onKeyboardNavigationExit?: () => void;
}

type ProcessedGroup<M extends types.DataMenuModel> = {
  readonly label?: ReactNode;
  readonly isGroup: true;
  readonly data: { model: M; index: number }[];
};

type ProcessedDatum<M extends types.DataMenuModel> = {
  readonly isGroup?: false;
  readonly model: M;
  readonly index: number;
};

type ProcessedData<M extends types.DataMenuModel> = (ProcessedDatum<M> | ProcessedGroup<M>)[];

export const DataMenuContent = forwardRef<
  types.DataMenuContentInstance,
  DataMenuContentProps<types.DataMenuModel>
>(
  <M extends types.DataMenuModel>(
    {
      className,
      style,
      data,
      groups,
      isLocked,
      isBordered,
      isLoading,
      hideEmptyGroups = true,
      hideGrouplessItems = false,
      enableKeyboardInteractions = true,
      groupContentClassName,
      groupLabelClassName,
      groupLabelContainerClassName,
      groupLabelProps,
      groupsAreBordered,
      includeDescriptions,
      children,
      onItemClick,
      getItemId,
      onKeyboardNavigationExit,
      ...props
    }: DataMenuContentProps<M>,
    ref: ForwardedRef<types.DataMenuContentInstance>,
  ): JSX.Element => {
    const menuItemRefs = useRef<MenuItemRefs>({});

    const { navigatedIndex, containerRef, incrementNavigatedIndex, decrementNavigatedIndex } =
      useKeyboardNavigation({
        data,
        enabled: enableKeyboardInteractions,
        onEnter: (e, index, datum) => {
          const menuItemRef = menuItemRefs.current[index];
          if (menuItemRef && menuItemRef.current) {
            onItemClick?.(e, datum, menuItemRef.current);
          }
        },
        onExit: onKeyboardNavigationExit,
      });

    useImperativeHandle(ref, () => ({
      focus: () => containerRef.current?.focus(),
      incrementNavigatedIndex,
      decrementNavigatedIndex,
    }));

    const processedData = useMemo<ProcessedData<M>>(() => {
      let index = 0;

      const getUpdatedIndex = () => {
        const updated = index;
        index += 1;
        return updated;
      };

      return (groups ?? []).reduce(
        (processed, group): ProcessedData<M> => {
          const filtered = data.filter(model => group.filter(model));
          if (filtered.length !== 0 || hideEmptyGroups === false) {
            return [
              ...processed,
              filtered.reduce(
                (gp, model) => ({
                  ...gp,
                  data: [...gp.data, { model, index: getUpdatedIndex() }],
                }),
                {
                  isGroup: true,
                  label: group.label,
                  data: [] as ProcessedGroup<M>["data"],
                },
              ),
            ];
          }
          return processed;
        },
        !hideGrouplessItems
          ? data.reduce((acc, model) => {
              if (!groups || groups.length === 0 || groups.every(group => !group.filter(model))) {
                return [...acc, { model, index: getUpdatedIndex() }];
              }
              return acc;
            }, [] as ProcessedData<M>)
          : ([] as ProcessedData<M>),
      );
    }, [data, groups, hideGrouplessItems, hideEmptyGroups]);

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
            {...props}
            ref={itemRef}
            id={id}
            datum={model}
            includeDescription={includeDescriptions}
            isCurrentNavigation={enableKeyboardInteractions && navigatedIndex === index}
            onClick={(e, instance) => onItemClick?.(e, model, instance)}
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
    return (
      <MenuContent
        ref={containerRef}
        style={style}
        className={className}
        isBordered={isBordered}
        isLoading={isLoading}
        isLocked={isLocked}
        groupsAreBordered={groupsAreBordered}
      >
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
    props: DataMenuContentProps<M> & {
      readonly ref?: ForwardedRef<types.DataMenuContentInstance>;
    },
  ): JSX.Element;
};

export default DataMenuContent;
