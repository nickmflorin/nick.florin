"use client";
import React from "react";

import pick from "lodash.pick";

import { logger } from "~/application/logger";

import { Spinner } from "./Spinner";
import { type IconProp, type DynamicIconProp, type IconProps, isIconProp } from "./types";
import { getIconClassName, getNativeIconStyle } from "./util";

const iconIsDynamic = (icon: IconProp | DynamicIconProp): icon is DynamicIconProp =>
  Array.isArray(icon);

/**
 * Renders an icon element, <i>, with the appropriate class name, style and data-attributes that
 * allow the FontAwesome package to replace the <i> element with an <svg> element corresponding to
 * the appropriate FontAwesome icon.
 *
 * Note:
 * -----
 * The "@fortawesome/react-fontawesome" package's <FontAwesomeIcon /> component does not work
 * properly with the FontAwesome Icon Kit.  We use the Icon Kit because it dynamically loads just
 * the icons that we need from a CDN - which is much faster and easier to maintain.
 *
 * However, it does not work with React - only CSS classes.  Since the <FontAwesomeIcon /> component
 * simply renders an SVG element, we can mimic its behavior by rendering an SVG inside of an <i>
 * element, where the <i> element is given the Font Awesome class names that are defined in the
 * content loaded from the CDN (these class names are generated via the 'getNativeIconClassName'
 * method.
 */
export const Icon = ({ icon, visible, hidden, ...props }: IconProps) => {
  const isVisible = hidden !== true && visible !== false;
  /* This should be prevented by type-checks on the props, but since TS is not aware that both of
     these cannot be undefined at the same time, we simply check it here to satisfy the compiler. */
  if (icon !== undefined || props.name !== undefined) {
    /* If the icon is dynamic, it will not be included in the component's props as explicit parts
       (i.e. there will be an 'icon' prop, not 'name', 'family', and 'iconStyle' props). */
    if (icon !== undefined && iconIsDynamic(icon)) {
      const visibleIcons = icon.filter(i => i.visible === true);
      if (visibleIcons.length === 0) {
        logger.error(
          { icon: icon },
          "The dynamically provided set of icons does not include a visible icon. " +
            "No icon will be rendered.",
        );
        return <></>;
      } else if (visibleIcons.length > 1) {
        logger.error(
          { icon: icon },
          "The dynamically provided set of icons includes multiple visible icons. " +
            "Only the first will be rendered.",
        );
      }
      let visibleIconEncountered = false;
      return (
        <>
          {icon.map((i, index) => {
            // Omit the hidden flag - it is encompassed in the isVisible flag.
            const ps = {
              ...props,
              icon: i.icon,
            } as IconProps;
            if (i.visible && !visibleIconEncountered) {
              visibleIconEncountered = true;
              // The hidden prop will cause all dynamic icons to be hidden.
              return <Icon {...ps} visible={isVisible} key={index} />;
            }
            return <Icon {...ps} visible={false} key={index} />;
          })}
        </>
      );
    }
    const ic = icon || pick(props, ["name", "family", "iconStyle"]);
    /* We have to perform this typeguard check to satisfy TS, because TS is not aware that since
       the IconComponentProps are a union type of the two methods of defining the 'icon' for the
       component: with an 'icon' prop or the explicit 'name', 'iconStyle' and 'family' props.
       When we spread the props to the component, TS loses this understanding - and thinks that
       all of the props ('icon', 'name', 'iconStyle', 'family') can be undefined - when in reality,
       as it is typed for this component's prop interface, if the 'icon' is undefined, then the
       'name', 'iconStyle' and 'family' props must all be defined, and vice versa. */
    if (!isIconProp(ic)) {
      throw new Error(
        "Improper implementation of the Icon!  The props are invalid, and this error " +
          "should have been prevented by type checks at compile time.",
      );
    }
    const { isLoading, disabled, onClick, style, ...rest } = props;
    if (isLoading) {
      return <Spinner isLoading {...props} />;
    }
    return (
      <i
        onClick={e => {
          if (disabled !== true) {
            onClick?.(e);
          }
        }}
        style={
          isVisible === false
            ? { ...style, display: "none", ...getNativeIconStyle(rest) }
            : { ...style, ...getNativeIconStyle(rest) }
        }
        className={getIconClassName({
          ...rest,
          icon: ic,
        })}
      />
    );
  } else {
    return <></>;
  }
};

export default Icon;
