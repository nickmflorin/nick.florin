import dynamic from "next/dynamic";
import React, { type ForwardedRef, forwardRef } from "react";

import clsx from "clsx";

import type * as types from "../types";

import { Loading } from "~/components/feedback/Loading";
import { FloatingContent } from "~/components/floating/FloatingContent";
import {
  type MenuProps,
  type AbstractMenuProps,
  type MenuValue,
  type AbstractMenuComponent,
  type MenuInitialValue,
} from "~/components/menus";
import { type ComponentProps } from "~/components/types";

const AbstractMenu = dynamic(() => import("~/components/menus/generic/AbstractMenu"), {
  loading: () => <Loading isLoading={true} spinnerSize="16px" />,
}) as AbstractMenuComponent;

export interface FloatingSelectContentProps<
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> extends Omit<AbstractMenuProps<M, O>, "value" | "children" | keyof ComponentProps>,
    ComponentProps {
  readonly value: MenuInitialValue<M, O> | MenuValue<M, O>;
  readonly itemRenderer?: types.SelectItemRenderer<M>;
}

export const FloatingSelectContent = forwardRef<
  HTMLDivElement,
  FloatingSelectContentProps<types.SelectModel, types.SelectOptions<types.SelectModel>>
>(
  <M extends types.SelectModel, O extends types.SelectOptions<M>>(
    { className, style, isReady, value, itemRenderer, ...props }: FloatingSelectContentProps<M, O>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => (
    /* The style is needed for the FloatingContent to be positioned correctly with the Floating
       component's prop injection. */
    <FloatingContent variant="white" ref={ref} style={style} className="border">
      <AbstractMenu
        {...(props as MenuProps<M, O>)}
        isReady={isReady}
        className={clsx("z-50", className)}
        value={value}
      >
        {itemRenderer ? m => itemRenderer(m) : undefined}
      </AbstractMenu>
    </FloatingContent>
  ),
) as {
  <M extends types.SelectModel, O extends types.SelectOptions<M>>(
    props: FloatingSelectContentProps<M, O> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};
