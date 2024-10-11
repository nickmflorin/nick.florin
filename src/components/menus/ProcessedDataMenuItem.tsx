import React, { forwardRef, type ForwardedRef, type ReactNode } from "react";

import { omit } from "lodash-es";

import { type MenuItemClickEvent } from "~/components/menus";
import * as types from "~/components/menus";

import { CustomDataMenuItem } from "./CustomDataMenuItem";
import { DataMenuItem, type DataMenuItemProps } from "./DataMenuItem";

export interface ProcessedDataMenuItemProps<
  M extends types.DataMenuModel,
  O extends types.DataMenuOptions<M>,
> extends Omit<DataMenuItemProps<M>, "datum" | "onItemClick" | "id"> {
  readonly datum: types.DataMenuProcessedModel<M> | types.DataMenuProcessedCustom;
  readonly options: O;
  readonly onItemClick?: (
    e: MenuItemClickEvent,
    datum: M,
    instance: types.ConnectedMenuItemInstance,
  ) => void;
  readonly children?: (datum: M, params: types.MenuItemRenderProps) => ReactNode;
}

export const ProcessedDataMenuItem = forwardRef(
  <M extends types.DataMenuModel, O extends types.DataMenuOptions<M>>(
    { datum, options, children, onItemClick, ...props }: ProcessedDataMenuItemProps<M, O>,
    ref?: ForwardedRef<types.ConnectedMenuItemInstance>,
  ) => {
    if (datum.isCustom) {
      const m = datum.model;
      if (types.dataMenuModelArgIsCustomModel(m)) {
        return (
          <CustomDataMenuItem
            /* The flag props (e.g. itemIsDisabled, itemIsSelected, etc.) cannot be used since they
               are all calbacks that take the model M as the first and only argument (which is not
               in context here).  Same thing applies to the accessor props.

               Additionally, custom menu model items cannot exhibit a selected state. */
            {...omit(
              types.omitDataMenuItemAccessorProps(types.omitDataMenuItemOuterFlagProps(props)),
              ["itemSelectedClassName", "isSelected", "selectionIndicator"],
            )}
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
            datum={m}
          />
        );
      }
      return m;
    }
    const id = types.getDataMenuModelId(datum.model, options) ?? `menu-item-${datum.index}`;
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
  <M extends types.DataMenuModel, O extends types.DataMenuOptions<M>>(
    props: ProcessedDataMenuItemProps<M, O> & {
      readonly ref?: ForwardedRef<types.ConnectedMenuItemInstance>;
    },
  ): JSX.Element;
};
