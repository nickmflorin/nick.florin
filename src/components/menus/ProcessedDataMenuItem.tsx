import React, { forwardRef, type ForwardedRef, type ReactNode } from "react";

import { omit } from "lodash-es";

import * as types from "~/components/menus";

import { DataMenuItem, type DataMenuItemProps } from "./DataMenuItem";
import { MenuItemGroup } from "./MenuItemGroup";

export interface ProcessedDataMenuItemProps<M extends types.DataMenuModel>
  extends Omit<DataMenuItemProps<M>, "datum" | "onItemClick" | "id">,
    Omit<
      types.DataMenuGroupProps<M>,
      "hideEmptyGroups" | "hideGrouplessItems" | "groups" | "itemIsVisible" | "isCustom"
    >,
    Pick<types.DataMenuItemAccessorProps<M>, "getItemId"> {
  readonly datum: types.DataMenuProcessedDatum<M>;
  readonly onItemClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | KeyboardEvent,
    datum: M,
    instance: types.MenuItemInstance,
  ) => void;
  readonly children?: (datum: M, params: types.MenuItemRenderProps) => ReactNode;
}

export const ProcessedDataMenuItem = forwardRef(
  <M extends types.DataMenuModel>(
    {
      datum,
      groupContentClassName,
      groupLabelClassName,
      groupLabelContainerClassName,
      groupLabelProps,
      getItemId,
      children,
      onItemClick,
      ...props
    }: ProcessedDataMenuItemProps<M>,
    ref?: ForwardedRef<types.MenuItemInstance>,
  ) => {
    if (datum.isGroup) {
      return (
        <MenuItemGroup
          label={datum.label}
          labelProps={groupLabelProps}
          labelClassName={groupLabelClassName}
          labelContainerClassName={groupLabelContainerClassName}
          contentClassName={groupContentClassName}
        >
          {datum.data.map(datum => {
            const id = getItemId?.(datum.model) ?? datum.model.id ?? `menu-item-${datum.index}`;
            return (
              <DataMenuItem<M>
                {...props}
                key={id}
                ref={ref}
                id={id}
                datum={datum.model}
                onItemClick={(e, instance) => onItemClick?.(e, datum.model, instance)}
              >
                {children}
              </DataMenuItem>
            );
          })}
        </MenuItemGroup>
      );
    } else if (datum.isCustom) {
      const m = datum.model;
      if (types.dataMenuCustomModelIsObject(m)) {
        const id = m.id ?? `menu-item-${datum.index}`;
        return (
          <DataMenuItem<types.DataMenuCustomModel>
            /* The flag props (e.g. itemIsDisabled, itemIsSelected, etc.) cannot be used since they
               are all calbacks that take the model M as the first and only argument (which is not
               in context here).  Same thing applies to the accessor props.

               Additionally, custom menu model items cannot exhibit a selected state. */
            {...omit(
              types.omitDataMenuItemAccessorProps(types.omitDataMenuItemOuterFlagProps(props)),
              ["itemSelectedClassName", "isSelected", "selectionIndicator"],
            )}
            isCustom
            selectionIndicator="none"
            itemHeight={props.itemHeight}
            /* Since the various item class names can be a callback that takes the model M as
               an argument, they can only be applied to the custom menu items if they are not
               a callback.  This is because the custom menu item model is not associated with
               the same model M that is provided in the data that the Menu receives. */
            itemClassName={types.extractValueFromCallbackProp(props.itemClassName)}
            itemNavigatedClassName={types.extractValueFromCallbackProp(
              props.itemNavigatedClassName,
            )}
            itemSpinnerClassName={types.extractValueFromCallbackProp(props.itemSpinnerClassName)}
            itemIconClassName={types.extractValueFromCallbackProp(props.itemIconClassName)}
            itemDisabledClassName={types.extractValueFromCallbackProp(props.itemDisabledClassName)}
            itemLoadingClassName={types.extractValueFromCallbackProp(props.itemLoadingClassName)}
            itemLockedClassName={types.extractValueFromCallbackProp(props.itemLockedClassName)}
            ref={ref}
            id={id}
            datum={m}
          >
            {m.renderer !== undefined ? (_, params) => m.renderer?.(params) : undefined}
          </DataMenuItem>
        );
      }
      return m;
    }
    const id = getItemId?.(datum.model) ?? datum.model.id ?? `menu-item-${datum.model.index}`;
    return (
      <DataMenuItem<M>
        {...props}
        ref={ref}
        id={id}
        datum={datum.model}
        onItemClick={(e, instance) => onItemClick?.(e, datum.model, instance)}
      >
        {children}
      </DataMenuItem>
    );
  },
) as {
  <M extends types.DataMenuModel>(
    props: ProcessedDataMenuItemProps<M> & {
      readonly ref?: ForwardedRef<types.MenuItemInstance>;
    },
  ): JSX.Element;
};
