import { forwardRef, type ForwardedRef } from "react";

import { omit, pick } from "lodash-es";

import type * as types from "~/components/menus";
import { Menu } from "~/components/menus/Menu";
import { MenuFooter } from "~/components/menus/MenuFooter";
import { MenuHeader } from "~/components/menus/MenuHeader";

import { DataMenuContent, type DataMenuContentProps } from "./DataMenuContent";

export type DataMenuComponent = {
  <M extends types.DataMenuModel>(
    props: DataMenuProps<M> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};

export interface DataMenuProps<M extends types.DataMenuModel> extends DataMenuContentProps<M> {
  readonly header?: JSX.Element;
  readonly footer?: JSX.Element;
  readonly search?: string;
  readonly onSearch?: (e: React.ChangeEvent<HTMLInputElement>, v: string) => void;
}

export const DataMenuPropsMap = {
  data: true,
  header: true,
  footer: true,
  search: true,
  id: true,
  className: true,
  style: true,
  enableKeyboardInteractions: true,
  selectionIndicator: true,
  children: true,
  includeDescriptions: true,
  __private_parent_prop__: true,
  // ~~~~~~~~ Event Handlers ~~~~~~~~
  onFocus: true,
  onBlur: true,
  onSearch: true,
  onKeyboardNavigationExit: true,
  // ~~~~~~~~ State ~~~~~~~~
  isDisabled: true,
  isLocked: true,
  isBordered: true,
  isLoading: true,
  // ~~~~~~~~ Groups ~~~~~~~~
  groups: true,
  hideEmptyGroups: true,
  hideGrouplessItems: true,
  groupContentClassName: true,
  groupLabelClassName: true,
  groupLabelContainerClassName: true,
  groupLabelProps: true,
  groupsAreBordered: true,
  // ~~~~~~~~ Item State/Characteristics ~~~~~~~~
  itemIsVisible: true,
  getItemIcon: true,
  getItemDescription: true,
  getItemId: true,
  onItemClick: true,
  itemSelectedClassName: true,
  itemIsDisabled: true,
  itemIsLoading: true,
  itemIsLocked: true,
  itemIsSelected: true,
  itemClassName: true,
  itemHeight: true,
  itemNavigatedClassName: true,
  itemSpinnerClassName: true,
  itemLockedClassName: true,
  itemIconClassName: true,
  itemIconProps: true,
  itemIconSize: true,
  itemDisabledClassName: true,
  itemLoadingClassName: true,
  // ~~~~~~~~ Feedback Props ~~~~~~~~
  isEmpty: true,
  isError: true,
  hasNoResults: true,
  emptyContent: true,
  noResultsContent: true,
  errorTitle: true,
  errorMessage: true,
  errorContent: true,
  feedbackClassName: true,
  feedbackStyle: true,
} as const satisfies {
  [key in keyof Required<DataMenuProps<types.DataMenuModel>>]: true;
};

export const omitDataMenuProps = <P extends Record<string, unknown>, M extends types.DataMenuModel>(
  props: P,
): Omit<P, keyof typeof DataMenuPropsMap & keyof P> =>
  omit(props, Object.keys(DataMenuPropsMap) as (keyof Required<DataMenuProps<M>>)[]);

export const pickDataMenuProps = <P extends Record<string, unknown>, M extends types.DataMenuModel>(
  props: P,
): Pick<P, keyof typeof DataMenuPropsMap & keyof P> =>
  pick(props, Object.keys(DataMenuPropsMap) as (keyof Required<DataMenuProps<M>>)[]);

export const DataMenu = forwardRef<HTMLDivElement, DataMenuProps<types.DataMenuModel>>(
  <M extends types.DataMenuModel>(
    { header, footer, search, style, className, onSearch, ...props }: DataMenuProps<M>,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <Menu style={style} className={className} ref={ref}>
      <MenuHeader search={search} onSearch={onSearch}>
        {header}
      </MenuHeader>
      <DataMenuContent {...props} />
      <MenuFooter>{footer}</MenuFooter>
    </Menu>
  ),
) as DataMenuComponent;

export default DataMenu;
