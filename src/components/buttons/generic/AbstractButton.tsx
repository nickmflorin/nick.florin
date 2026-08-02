import url from 'url';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import { type ForwardedRef, type JSX, type ComponentProps as ReactComponentProps } from 'react';

import { omit, pick } from 'lodash-es';

import type * as types from '~/components/buttons';
import { classNames, type ComponentProps, parseDataAttributes } from '~/components/types';

type InternalPropName = keyof Required<types.AbstractInternalButtonProps<types.ButtonElement>>;

/* We use a map here for extra type safety, because it ensures that all of the internal props are
   accounted for in the map. */
const INTERNAL_BUTTON_PROPS = {
  activeClassName: true,
  buttonType: true,
  className: true,
  disabledClassName: true,
  element: true,
  isActive: true,
  isDisabled: true,
  isLoading: true,
  isLocked: true,
  loadingClassName: true,
  lockedClassName: true,
  openInNewTab: true,
  radius: true,
  scheme: true,
  style: true,
  tourId: true,
} as const satisfies Record<InternalPropName, true>;

const toNativeButtonProps = <E extends types.ButtonElement>(
  props: types.AbstractButtonProps<E>,
): types.NativeButtonProps<E> => {
  const keys = Object.keys(INTERNAL_BUTTON_PROPS) as InternalPropName[];
  /* The coercion is safe because 'INTERNAL_BUTTON_PROPS' is constrained to contain every internal
     prop name, so omitting its keys leaves only the native props. */
  return omit(props, keys) as unknown as types.NativeButtonProps<E>;
};

const NativeButton = ({
  ref,
  ...props
}: ComponentProps & ReactComponentProps<'button'>): JSX.Element => (
  <button {...props} className={classNames(props.className)} ref={ref} />
);

const NativeAnchor = ({
  children,
  className,
  href,
  ref,
  ...props
}: {
  readonly href?: string | url.UrlObject;
} & ComponentProps &
  Omit<ReactComponentProps<'a'>, 'href'>): JSX.Element => (
  <a
    {...props}
    className={classNames(className)}
    href={typeof href === 'string' ? href : href === undefined ? undefined : url.format(href)}
    ref={ref}
  >
    {children}
  </a>
);

const NativeLink = ({
  className,
  ref,
  ...props
}: { readonly ref?: ForwardedRef<HTMLAnchorElement> } & ComponentProps &
  NextLinkProps): JSX.Element => (
  <NextLink {...props} className={classNames(className)} ref={ref ?? null} />
);

const NativeDiv = ({ ref, ...props }: ComponentProps & ReactComponentProps<'div'>): JSX.Element => (
  <div {...props} className={classNames(props.className)} ref={ref} />
);

export const AbstractButton = <E extends types.ButtonElement>(
  props: { readonly ref?: types.PolymorphicButtonRef<E> } & types.AbstractButtonProps<E>,
): JSX.Element => {
  const nativeProps = {
    ...toNativeButtonProps(props),
    ...parseDataAttributes({
      ...pick(props, [
        'tourId',
        'isDisabled',
        'isLocked',
        'isLoading',
        'isActive',
        'scheme',
        'radius',
      ] as const),
      type: props.buttonType,
    }),
    className: classNames(
      'button',
      props.className,
      /* These class names should override any class name that may already exist in the props if
         the button is in the given state - so they should come after 'props.className'. */
      { [classNames(props.lockedClassName)]: props.isLocked },
      { [classNames(props.loadingClassName)]: props.isLoading },
      { [classNames(props.disabledClassName)]: props.isDisabled },
      { [classNames(props.activeClassName)]: props.isActive },
    ),
    style: props.style,
  };

  switch (props.element) {
    case 'a': {
      const openInNewTab = props.openInNewTab ?? false;
      return (
        <NativeAnchor
          {...(nativeProps as types.NativeButtonProps<'a'>)}
          ref={props.ref as types.PolymorphicButtonRef<'a'>}
          rel={
            openInNewTab ? 'noopener noreferrer' : (nativeProps as types.NativeButtonProps<'a'>).rel
          }
          target={openInNewTab ? '_blank' : (nativeProps as types.NativeButtonProps<'a'>).target}
        />
      );
    }
    case 'div': {
      return (
        <NativeDiv
          {...(nativeProps as types.NativeButtonProps<'div'>)}
          ref={props.ref as types.PolymorphicButtonRef<'div'>}
        />
      );
    }
    case 'link': {
      return (
        <NativeLink
          {...(nativeProps as types.NativeButtonProps<'link'>)}
          ref={props.ref as types.PolymorphicButtonRef<'a'>}
        />
      );
    }
    default: {
      return (
        <NativeButton
          type='button'
          {...(nativeProps as types.NativeButtonProps<'button'>)}
          disabled={props.isDisabled}
          ref={props.ref as types.PolymorphicButtonRef<'button'>}
        />
      );
    }
  }
};
