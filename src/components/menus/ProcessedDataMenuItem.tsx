import { type JSX, type ReactNode, type Ref } from 'react';

import { omit } from 'lodash-es';

import { type MenuItemClickEvent } from '~/components/menus';
import * as types from '~/components/menus';

import { CustomDataMenuItem } from './CustomDataMenuItem';
import { DataMenuItem, type DataMenuItemProps } from './DataMenuItem';

export interface ProcessedDataMenuItemProps<
  M extends types.DataMenuModel,
  O extends types.DataMenuOptions<M>,
> extends Omit<DataMenuItemProps<M>, 'datum' | 'id' | 'onItemClick'> {
  readonly children?: (datum: M, params: types.MenuItemRenderProps) => ReactNode;
  readonly datum: types.DataMenuProcessedCustom | types.DataMenuProcessedModel<M>;
  readonly onItemClick?: (
    e: MenuItemClickEvent,
    datum: M,
    instance: types.ConnectedMenuItemInstance,
  ) => void;
  readonly options: O;
}

export const ProcessedDataMenuItem = <
  M extends types.DataMenuModel,
  O extends types.DataMenuOptions<M>,
>({
  children,
  datum,
  onItemClick,
  options,
  ref,
  ...props
}: {
  readonly ref?: Ref<types.ConnectedMenuItemInstance>;
} & ProcessedDataMenuItemProps<M, O>): JSX.Element => {
  if (datum.isCustom) {
    const m = datum.model;
    if (types.dataMenuModelArgIsCustomModel(m)) {
      return (
        <CustomDataMenuItem
          /* The flag props (e.g. itemIsDisabled, itemIsSelected, etc.) cannot be used since they
             are all callbacks that take the model M as the first and only argument (which is not
             in context here).  Same thing applies to the accessor props.

             Additionally, custom menu model items cannot exhibit a selected state. */
          {...omit(
            types.omitDataMenuItemAccessorProps(types.omitDataMenuItemOuterFlagProps(props)),
            ['itemSelectedClassName', 'isSelected', 'selectionIndicator'],
          )}
          datum={m}
          /* Since the various item class names can be a callback that takes the model M as
             an argument, they can only be applied to the custom menu items if they are not
             a callback.  This is because the custom menu item model is not associated with
             the same model M that is provided in the data that the Menu receives. */
          itemClassName={types.extractValueFromCallbackProp(props.itemClassName)}
          itemDisabledClassName={types.extractValueFromCallbackProp(props.itemDisabledClassName)}
          itemIconClassName={types.extractValueFromCallbackProp(props.itemIconClassName)}
          itemLoadingClassName={types.extractValueFromCallbackProp(props.itemLoadingClassName)}
          itemLockedClassName={types.extractValueFromCallbackProp(props.itemLockedClassName)}
          itemNavigatedClassName={types.extractValueFromCallbackProp(props.itemNavigatedClassName)}
          itemSpinnerClassName={types.extractValueFromCallbackProp(props.itemSpinnerClassName)}
          ref={ref}
        />
      );
    }
    return m;
  }
  const id = types.getDataMenuModelId(datum.model, options) ?? `menu-item-${datum.index}`;
  return (
    <DataMenuItem<M>
      {...props}
      datum={datum.model}
      id={id}
      onItemClick={(e, instance) => onItemClick?.(e, datum.model, instance)}
      ref={ref}
    >
      {children}
    </DataMenuItem>
  );
};
