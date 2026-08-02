import { type ChangeEvent, type ForwardedRef, type JSX, useImperativeHandle, useRef } from 'react';

import type * as types from '~/components/menus';
import { Menu } from '~/components/menus/Menu';
import { MenuFooter } from '~/components/menus/MenuFooter';
import { MenuHeader } from '~/components/menus/MenuHeader';
import { ifRefConnected } from '~/components/types';

import { DataMenuContent, type DataMenuContentProps } from './DataMenuContent';

export type DataMenuComponent = <M extends types.DataMenuModel, O extends types.DataMenuOptions<M>>(
  props: { readonly ref?: ForwardedRef<types.DataMenuInstance<M, O>> } & DataMenuProps<M, O>,
) => JSX.Element;

export interface DataMenuProps<
  M extends types.DataMenuModel,
  O extends types.DataMenuOptions<M>,
> extends DataMenuContentProps<M, O> {
  readonly footer?: JSX.Element;
  readonly header?: JSX.Element;
  readonly onSearch?: (e: ChangeEvent<HTMLInputElement>, v: string) => void;
  readonly search?: string;
}

export const DataMenu = (<M extends types.DataMenuModel, O extends types.DataMenuOptions<M>>({
  className,
  footer,
  header,
  onSearch,
  ref,
  search,
  style,
  ...props
}: { readonly ref?: ForwardedRef<types.DataMenuInstance<M, O>> } & DataMenuProps<
  M,
  O
>): JSX.Element => {
  const contentRef = useRef<null | types.DataMenuContentInstance<M, O>>(null);

  useImperativeHandle(ref, () => ({
    createInstance: <CO extends types.CreateDataMenuItemInstanceOptions>(
      m: types.DataMenuItemInstanceLookupArg<M, O>,
      opts?: CO,
    ) =>
      ifRefConnected(contentRef, c => c.createInstance(m, opts), {
        methodName: 'createInstance',
        name: 'data-menu-content',
        strict: true,
      }),
    createInstanceIfNecessary: (...args) =>
      ifRefConnected(contentRef, c => c.createInstanceIfNecessary(...args), {
        methodName: 'createInstanceIfNecessary',
        name: 'data-menu-content',
        strict: true,
      }),
    decrementNavigatedIndex: () => contentRef.current?.decrementNavigatedIndex(),
    focus: () => contentRef.current?.focus(),
    getInstance: (...args) =>
      ifRefConnected(contentRef, c => c.getOrCreateInstance(...args), {
        methodName: 'getInstance',
        name: 'data-menu-content',
        strict: true,
      }),
    getOrCreateInstance: (...args) =>
      ifRefConnected(contentRef, c => c.getOrCreateInstance(...args), {
        methodName: 'getOrCreateInstance',
        name: 'data-menu-content',
        strict: true,
      }),
    incrementNavigatedIndex: () => contentRef.current?.incrementNavigatedIndex(),
  }));

  return (
    <Menu className={className} style={style}>
      <MenuHeader onSearch={onSearch} search={search}>
        {header}
      </MenuHeader>
      <DataMenuContent {...props} ref={contentRef} />
      <MenuFooter>{footer}</MenuFooter>
    </Menu>
  );
}) as DataMenuComponent;
