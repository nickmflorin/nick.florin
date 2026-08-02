import { type ForwardedRef, type JSX, type ComponentProps as ReactComponentProps } from 'react';

import { omit, pick } from 'lodash-es';

import { Loading } from '~/components/loading/Loading';
import { classNames, type ComponentProps, parseDataAttributes } from '~/components/types';

import { MenuFeedbackState } from './MenuFeedbackState';
import { hasFeedback, type MenuFeedbackProps } from './types';

type MenuContentParentType = 'group' | 'menu';

type IfForMenu<P extends MenuContentParentType, T, F = never> = P extends 'menu' ? T : F;

const PrimaryClassNames: Record<MenuContentParentType, string> = {
  group: 'menu__item-group__content',
  menu: 'menu__content',
};

export interface MenuContentProps<P extends MenuContentParentType>
  extends
    ComponentProps,
    Pick<ReactComponentProps<'div'>, 'id' | 'onBlur' | 'onFocus'>,
    MenuFeedbackProps {
  readonly __private_parent_prop__?: P;
  readonly children?: (JSX.Element | null)[] | JSX.Element | null;
  readonly groupsAreBordered?: IfForMenu<P, boolean>;
  readonly isBordered?: boolean;
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly isLocked?: boolean;
}

export const MenuContentPropsMap = {
  /* eslint-disable-next-line camelcase -- The underscores intentionally mark this as an
     internal, non-public prop. */
  __private_parent_prop__: true,
  children: true,
  className: true,
  emptyContent: true,
  errorContent: true,
  errorMessage: true,
  errorTitle: true,
  feedbackClassName: true,
  feedbackStyle: true,
  groupsAreBordered: true,
  hasNoResults: true,
  id: true,
  isBordered: true,
  isDisabled: true,
  isEmpty: true,
  isError: true,
  isLoading: true,
  isLocked: true,
  noResultsContent: true,
  onBlur: true,
  onFocus: true,
  style: true,
} as const satisfies {
  [key in keyof Required<MenuContentProps<MenuContentParentType>>]: true;
};

export const omitMenuContentProps = <
  P extends Record<string, unknown>,
  T extends MenuContentParentType,
>(
  props: P,
): Omit<P, keyof P & keyof typeof MenuContentPropsMap> =>
  omit(props, Object.keys(MenuContentPropsMap) as (keyof Required<MenuContentProps<T>>)[]);

export const pickMenuContentProps = <
  P extends Record<string, unknown>,
  T extends MenuContentParentType,
>(
  props: P,
): Pick<P, keyof P & keyof typeof MenuContentPropsMap> =>
  pick(props, Object.keys(MenuContentPropsMap) as (keyof Required<MenuContentProps<T>>)[]);

export const MenuContent = <P extends MenuContentParentType>({
  __private_parent_prop__ = 'menu' as P,
  children,
  emptyContent,
  errorContent,
  errorMessage,
  errorTitle,
  feedbackClassName,
  feedbackStyle,
  groupsAreBordered = false as IfForMenu<P, boolean>,
  hasNoResults,
  isBordered = false,
  isDisabled = false,
  isEmpty,
  isError,
  isLoading = false,
  isLocked = false,
  noResultsContent,
  ref,
  ...props
}: { readonly ref?: ForwardedRef<HTMLDivElement> } & MenuContentProps<P>): JSX.Element | null => {
  const validChildren = (
    Array.isArray(children) ? children : children === undefined ? [] : [children]
  ).filter((ch): ch is JSX.Element => ch !== null);

  /* eslint-disable-next-line camelcase -- The underscores intentionally mark this as an
     internal, non-public prop. */
  const primaryClassName = PrimaryClassNames[__private_parent_prop__];

  if (validChildren.length !== 0 || hasFeedback({ hasNoResults, isEmpty, isError })) {
    return (
      <div
        {...props}
        {...parseDataAttributes({
          /* eslint-disable-next-line camelcase -- The underscores intentionally mark this as
             an internal, non-public prop. */
          borderedGroups: groupsAreBordered && __private_parent_prop__ !== 'group',
          isBordered,
          isDisabled,
          isLoading,
          isLocked,
        })}
        className={classNames(primaryClassName, props.className)}
        ref={ref}
      >
        <Loading isLoading={isLoading} position='fixed'>
          <MenuFeedbackState
            className={feedbackClassName}
            emptyContent={emptyContent}
            errorContent={errorContent}
            errorMessage={errorMessage}
            errorTitle={errorTitle}
            hasNoResults={hasNoResults}
            isEmpty={isEmpty}
            isError={isError}
            noResultsContent={noResultsContent}
            style={feedbackStyle}
          >
            {children}
          </MenuFeedbackState>
        </Loading>
      </div>
    );
  }
  return null;
};
