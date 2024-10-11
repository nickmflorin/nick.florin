import { forwardRef, type ForwardedRef, useRef, useImperativeHandle } from "react";

import type * as types from "~/components/menus";
import { Menu } from "~/components/menus/Menu";
import { MenuFooter } from "~/components/menus/MenuFooter";
import { MenuHeader } from "~/components/menus/MenuHeader";
import { ifRefConnected } from "~/components/types";

import { DataMenuContent, type DataMenuContentProps } from "./DataMenuContent";

export type DataMenuComponent = {
  <M extends types.DataMenuModel, O extends types.DataMenuOptions<M>>(
    props: DataMenuProps<M, O> & { readonly ref?: ForwardedRef<types.DataMenuInstance<M, O>> },
  ): JSX.Element;
};

export interface DataMenuProps<M extends types.DataMenuModel, O extends types.DataMenuOptions<M>>
  extends DataMenuContentProps<M, O> {
  readonly header?: JSX.Element;
  readonly footer?: JSX.Element;
  readonly search?: string;
  readonly onSearch?: (e: React.ChangeEvent<HTMLInputElement>, v: string) => void;
}

export const DataMenu = forwardRef(
  <M extends types.DataMenuModel, O extends types.DataMenuOptions<M>>(
    { header, footer, search, style, className, onSearch, ...props }: DataMenuProps<M, O>,
    ref: ForwardedRef<types.DataMenuInstance<M, O>>,
  ): JSX.Element => {
    const contentRef = useRef<types.DataMenuContentInstance<M, O> | null>(null);

    useImperativeHandle(ref, () => ({
      getInstance: (...args) =>
        ifRefConnected(contentRef, c => c.getOrCreateInstance(...args), {
          strict: true,
          methodName: "getInstance",
          name: "data-menu-content",
        }),
      getOrCreateInstance: (...args) =>
        ifRefConnected(contentRef, c => c.getOrCreateInstance(...args), {
          strict: true,
          methodName: "getOrCreateInstance",
          name: "data-menu-content",
        }),
      createInstance: <CO extends types.CreateDataMenuItemInstanceOptions>(
        m: types.DataMenuItemInstanceLookupArg<M, O>,
        opts?: CO,
      ) =>
        ifRefConnected(contentRef, c => c.createInstance(m, opts), {
          strict: true,
          methodName: "createInstance",
          name: "data-menu-content",
        }),
      createInstanceIfNecessary: (...args) =>
        ifRefConnected(contentRef, c => c.createInstanceIfNecessary(...args), {
          strict: true,
          methodName: "createInstanceIfNecessary",
          name: "data-menu-content",
        }),
      focus: () => contentRef.current?.focus(),
      incrementNavigatedIndex: () => contentRef.current?.incrementNavigatedIndex(),
      decrementNavigatedIndex: () => contentRef.current?.decrementNavigatedIndex(),
    }));

    return (
      <Menu style={style} className={className}>
        <MenuHeader search={search} onSearch={onSearch}>
          {header}
        </MenuHeader>
        <DataMenuContent {...props} ref={contentRef} />
        <MenuFooter>{footer}</MenuFooter>
      </Menu>
    );
  },
) as DataMenuComponent;

export default DataMenu;
