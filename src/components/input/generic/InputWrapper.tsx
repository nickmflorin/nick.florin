import { type ForwardedRef, type JSX, type ComponentProps as ReactComponentProps } from 'react';

import { UnreachableCaseError } from '~/application/errors';

import {
  type InputSize,
  InputSizes,
  type InputVariant,
  InputVariants,
} from '~/components/input/types';
import {
  BorderRadii,
  type BorderRadius,
  classNames,
  type ComponentProps,
  getTypographyClassName,
  getTypographyStyle,
  omitTypographyProps,
  parseDataAttributes,
  type TypographyCharacteristics,
} from '~/components/types';

type WrapperComponentName = 'div' | 'textarea';

type WrapperElement<C extends WrapperComponentName> = {
  div: HTMLDivElement;
  textarea: HTMLTextAreaElement;
}[C];

export type InputWrapperProps<C extends WrapperComponentName> = {
  readonly component: C;
  readonly hasDynamicHeight?: boolean;
  readonly isActive?: boolean;
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly isLocked?: boolean;
  readonly isReadOnly?: boolean;
  readonly radius?: BorderRadius;
  readonly size?: InputSize;
  readonly variant?: InputVariant;
} & ComponentProps &
  Omit<ReactComponentProps<C>, keyof ComponentProps> &
  Omit<TypographyCharacteristics, 'align' | 'lineClamp' | 'transform' | 'truncate'>;

export const InputWrapper = <C extends WrapperComponentName>({
  children,
  component,
  hasDynamicHeight = false,
  isActive = false,
  isDisabled = false,
  isLoading = false,
  isLocked = false,
  isReadOnly = false,
  radius = BorderRadii.SM,
  ref,
  size = InputSizes.SMALL,
  variant = InputVariants.PRIMARY,
  ...props
}: { readonly ref?: ForwardedRef<WrapperElement<C>> } & InputWrapperProps<C>): JSX.Element => {
  const className = classNames('input', getTypographyClassName(props), props.className);
  const ps = {
    ...omitTypographyProps(props),
    ...parseDataAttributes({
      dynamicHeight: hasDynamicHeight,
      isActive,
      isDisabled,
      isLoading,
      isLocked,
      isReadOnly,
      radius,
      size,
      variant,
    }),
    children,
    className,
    ref,
    style: { ...getTypographyStyle(props), ...props.style },
  };
  switch (component) {
    case 'div':
      return <div {...(ps as ReactComponentProps<'div'>)} />;
    case 'textarea':
      return (
        <textarea
          disabled={isDisabled}
          {...(ps as ReactComponentProps<'textarea'>)}
          className={classNames('text-area', className)}
        />
      );
    default:
      throw new UnreachableCaseError(`Invalid 'component' provided: ${component}!`);
  }
};
