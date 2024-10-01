import React, { forwardRef, type ForwardedRef } from "react";

import { pick, omit } from "lodash-es";

import { Loading } from "~/components/loading/Loading";
import { type ComponentProps, classNames } from "~/components/types";

import { MenuFeedbackState } from "./MenuFeedbackState";
import { type MenuFeedbackProps, hasFeedback } from "./types";

type MenuContentParentType = "group" | "menu";

type IfForMenu<P extends MenuContentParentType, T, F = never> = P extends "menu" ? T : F;

const PrimaryClassNames: { [key in MenuContentParentType]: string } = {
  group: "menu__item-group__content",
  menu: "menu__content",
};

export interface MenuContentProps<P extends MenuContentParentType>
  extends ComponentProps,
    Pick<React.ComponentProps<"div">, "id" | "onFocus" | "onBlur">,
    MenuFeedbackProps {
  readonly isLocked?: boolean;
  readonly isBordered?: boolean;
  readonly groupsAreBordered?: IfForMenu<P, boolean>;
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly __private_parent_prop__?: P;
  readonly children?: JSX.Element | null | (JSX.Element | null)[];
}

export const MenuContentPropsMap = {
  id: true,
  __private_parent_prop__: true,
  className: true,
  style: true,
  isDisabled: true,
  isLocked: true,
  isBordered: true,
  isLoading: true,
  children: true,
  groupsAreBordered: true,
  onFocus: true,
  onBlur: true,
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
  [key in keyof Required<MenuContentProps<MenuContentParentType>>]: true;
};

export const omitMenuContentProps = <
  P extends Record<string, unknown>,
  T extends MenuContentParentType,
>(
  props: P,
): Omit<P, keyof typeof MenuContentPropsMap & keyof P> =>
  omit(props, Object.keys(MenuContentPropsMap) as (keyof Required<MenuContentProps<T>>)[]);

export const pickMenuContentProps = <
  P extends Record<string, unknown>,
  T extends MenuContentParentType,
>(
  props: P,
): Pick<P, keyof typeof MenuContentPropsMap & keyof P> =>
  pick(props, Object.keys(MenuContentPropsMap) as (keyof Required<MenuContentProps<T>>)[]);

export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps<MenuContentParentType>>(
  <P extends MenuContentParentType>(
    {
      isError,
      isEmpty,
      hasNoResults,
      emptyContent,
      noResultsContent,
      errorTitle,
      errorMessage,
      errorContent,
      isBordered = false,
      children,
      isLoading = false,
      isLocked = false,
      isDisabled = false,
      feedbackClassName,
      feedbackStyle,
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

    if (validChildren.length !== 0 || hasFeedback({ isError, isEmpty, hasNoResults })) {
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
          <Loading isLoading={isLoading} position="fixed">
            <MenuFeedbackState
              isEmpty={isEmpty}
              isError={isError}
              hasNoResults={hasNoResults}
              emptyContent={emptyContent}
              className={feedbackClassName}
              style={feedbackStyle}
              errorContent={errorContent}
              errorTitle={errorTitle}
              errorMessage={errorMessage}
              noResultsContent={noResultsContent}
            >
              {children}
            </MenuFeedbackState>
          </Loading>
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
