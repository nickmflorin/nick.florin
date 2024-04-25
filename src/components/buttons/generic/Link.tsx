import { forwardRef } from "react";

import clsx from "clsx";

import { capitalize } from "~/lib/formatters";
import { type MultipleIconProp } from "~/components/icons";
import { type Size } from "~/components/types";
import { type BaseTypographyProps } from "~/components/typography";

import * as types from "../types";

import { AbstractButton } from "./AbstractButton";
import { ButtonContent } from "./ButtonContent";

/**
 * Props for the `Link` component that are only applicable when the 'flex' prop is 'true'.
 *
 * When the 'flex' prop is 'true', the 'Link' component will render as a flex element, instead of
 * inline text.  In this case, the 'Link' will have the same inner structure as the 'Button'
 * component (e.g. it will be broken down into 'button__content' and 'button__sub-content'
 * sections).
 *
 * The 'Link' component cannot display loading indicators or other icons when it is not in 'flex'
 * mode, because they cannot be sized properly and will not be aligned with the text which will
 * be vertically aligned at the baseline (not the middle, which is the case for the 'flex' mode).
 */
export type LinkFlexProps<O extends types.ButtonOptions> = Omit<
  types.AbstractProps<"link", O>,
  "buttonType"
> &
  Omit<BaseTypographyProps, "fontSize"> & {
    /**
     * Determines whether or not the 'Link' component should be rendered as a flex element, rather
     * than an inline element.
     *
     * When 'true', the following apply:
     *
     * 1. The 'Link' component will be rendered as a flex element.
     * 2. The 'Link' component will have an inner content structure, similar to that of the 'Button'
     *    component.
     * 3. The 'Link' component will have its text vertically aligned in the middle, which means
     *    that it can be accompanied with loading indicators or other icons.
     */
    readonly flex: true;
    /**
     * @see LinkInlineProps
     */
    readonly inline?: false;
    readonly icon?: MultipleIconProp;
    readonly gap?: Size;
    readonly loadingLocation?: "left" | "over" | "right";
  };

export type LinkInlineProps<O extends types.ButtonOptions> = Omit<
  types.AbstractProps<"link", O>,
  "buttonType"
> &
  Omit<BaseTypographyProps, "fontSize"> & {
    /**
     * @see LinkFlexProps
     */
    readonly flex?: false;
    /**
     * Determines whether or not the 'Link' component should be rendered as an inline element,
     * rather than an flex element.
     *
     * When 'true', the following apply:
     *
     * 1. The 'Link' component will be rendered as an inline element such that it can be displayed
     *    directly next to, or in the middle of, accompanying text.
     * 2. The 'Link' component will not have an inner content structure, as seen in the 'Button'
     *    component.
     * 3. The 'Link' component will have its text vertically aligned at the baseline, which means
     *    that it cannot be accompanied with loading indicators or other icons.
     */
    readonly inline?: true;
    readonly icon?: never;
    readonly gap?: never;
    readonly loadingLocation?: never;
  };

export type LinkProps<O extends types.ButtonOptions> = LinkFlexProps<O> | LinkInlineProps<O>;

const Base = AbstractButton as React.FC<types.AbstractProps<"link", types.ButtonOptions>>;

const LocalLink = forwardRef(
  <O extends types.ButtonOptions>(
    {
      children,
      icon,
      flex,
      gap,
      /* Note: Since the 'Link' component does not have a 'height',  and it's 'height' is set based
         on the line-height of the text it contains, the 'iconSize' prop needs to be defaulted to
         a value that is not 100% of its parent container.  Otherwise, the icon and spinner will
         be very large. */
      iconSize = "small",
      loadingLocation,
      isLoading,
      ...props
    }: LinkProps<O>,
    ref: types.PolymorphicButtonRef<O>,
  ) => {
    const ps = {
      ...props,
      iconSize,
      isLoading,
      buttonType: "link",
    } as types.AbstractProps<"link", O>;
    return (
      <Base {...ps} ref={ref} className={clsx({ "link--flex": flex }, ps.className)}>
        {flex ? (
          <ButtonContent
            gap={gap}
            iconSize={iconSize}
            isLoading={isLoading}
            icon={icon}
            loadingLocation={loadingLocation}
          >
            {children}
          </ButtonContent>
        ) : (
          children
        )}
      </Base>
    );
  },
) as {
  <O extends types.ButtonOptions>(
    props: LinkProps<O> & { readonly ref?: types.PolymorphicButtonRef<O> },
  ): JSX.Element;
};

type VariantPartial = {
  <O extends types.ButtonOptions>(
    props: Omit<LinkProps<O>, "variant"> & { readonly ref?: types.PolymorphicButtonRef<O> },
  ): JSX.Element;
};

type WithVariants = { [key in Capitalize<types.ButtonVariant<"link">>]: VariantPartial };

const withVariants = types.ButtonVariants.link.values.reduce<WithVariants>(
  (acc, variant) => ({
    ...acc,
    [capitalize(variant)]: forwardRef(
      <O extends types.ButtonOptions>(
        props: Omit<LinkProps<O>, "variant">,
        ref: types.PolymorphicButtonRef<O>,
      ) => <Link<O> {...({ ...props, variant } as LinkProps<O>)} ref={ref} />,
    ),
  }),
  {} as WithVariants,
);

export const Link = Object.assign(LocalLink, withVariants);
