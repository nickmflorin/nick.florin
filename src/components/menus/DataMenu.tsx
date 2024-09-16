import { forwardRef, type ForwardedRef } from "react";

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
  readonly contentRef?: React.RefObject<types.DataMenuContentInstance>;
  readonly onSearch?: (e: React.ChangeEvent<HTMLInputElement>, v: string) => void;
}

export const DataMenu = forwardRef<HTMLDivElement, DataMenuProps<types.DataMenuModel>>(
  <M extends types.DataMenuModel>(
    { header, footer, search, style, contentRef, className, onSearch, ...props }: DataMenuProps<M>,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <Menu style={style} className={className} ref={ref}>
      <MenuHeader search={search} onSearch={onSearch}>
        {header}
      </MenuHeader>
      <DataMenuContent {...props} ref={contentRef} />
      <MenuFooter>{footer}</MenuFooter>
    </Menu>
  ),
) as DataMenuComponent;

export default DataMenu;
