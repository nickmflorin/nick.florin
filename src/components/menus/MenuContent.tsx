import React, { forwardRef, type ForwardedRef } from "react";

import { Loading } from "~/components/loading/Loading";
import { type ComponentProps, classNames } from "~/components/types";

type MenuContentParentType = "group" | "menu";

type IfForMenu<P extends MenuContentParentType, T, F = never> = P extends "menu" ? T : F;

export interface MenuContentProps<P extends MenuContentParentType>
  extends ComponentProps,
    Pick<React.ComponentProps<"div">, "id" | "onFocus" | "onBlur"> {
  readonly isLocked?: boolean;
  readonly isBordered?: boolean;
  readonly groupsAreBordered?: IfForMenu<P, boolean>;
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly __private_parent_prop__?: P;
  readonly children?: JSX.Element | null | (JSX.Element | null)[];
}

const PrimaryClassNames: { [key in MenuContentParentType]: string } = {
  group: "menu__item-group__content",
  menu: "menu__content",
};

export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps<MenuContentParentType>>(
  <P extends MenuContentParentType>(
    {
      isBordered = false,
      children,
      isLoading = false,
      isLocked = false,
      isDisabled = false,
      groupsAreBordered = false as IfForMenu<P, boolean>,
      __private_parent_prop__ = "menu" as P,
      ...props
    }: MenuContentProps<P>,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => {
    const validChildren = (
      Array.isArray(children) ? children : children !== undefined ? [children] : []
    ).filter((ch): ch is JSX.Element => ch !== null);

    const primaryClassName = PrimaryClassNames[__private_parent_prop__];

    if (validChildren.length !== 0) {
      return (
        <div
          {...props}
          ref={ref}
          className={classNames(
            primaryClassName,
            { disabled: isDisabled },
            {
              [`${primaryClassName}--bordered`]: isBordered,
              [`${primaryClassName}--bordered-groups`]:
                groupsAreBordered && __private_parent_prop__ !== "group",
              [`${primaryClassName}--loading`]: isLoading,
              [`${primaryClassName}--locked`]: isLocked,
            },
            props.className,
          )}
        >
          <Loading isLoading={isLoading}>{children}</Loading>
        </div>
      );
    }
    return <></>;
  },
) as {
  <P extends MenuContentParentType>(
    props: MenuContentProps<P> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};

export default MenuContent;
