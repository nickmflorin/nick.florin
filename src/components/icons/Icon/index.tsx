import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";

import { pick } from "lodash-es";

import { classNames } from "~/components/types";

import { Spinner } from "../Spinner";
import { type IconProp, type DynamicIconProp, type IconProps, isSvgIconProp } from "../types";

import { NativeIcon } from "./NativeIcon";
import { getIconClassName, getInternalIconClassName, getNativeIconStyle } from "./util";

const DynamicIconRenderer = dynamic(() => import("./DynamicIconRenderer"));

const iconIsDynamic = (icon: IconProp | DynamicIconProp): icon is DynamicIconProp =>
  Array.isArray(icon);

/**
 * Renders an icon element, <i>, with the appropriate class name, style and data-attributes.
 *
 * The icon can either be a Font Awesome icon (provided as either the 'icon' {@link IconProp} prop
 * or the 'name', {@link IconName}, 'family', {@link IconFamily}, and 'iconStyle', {@link IconStyle}
 * props), or a more general SVG component - provided as a child to the component.
 *
 * When the icon being rendered is a Font Awesome icon, the class names attributed to the <i>
 * element will allow the FontAwesome package to nest an <svg> element corresponding to the
 * appropriate Font Awesome icon inside of the <i> element.
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
export const Icon = ({
  icon,
  visible,
  hidden,
  children,
  isLoading,
  name,
  iconStyle,
  loadingClassName,
  family,
  ...props
}: IconProps) => {
  if (isLoading) {
    /* If the Icon is in a loading state, render the <Spinner /> animated SVG component with the
       exact same size as the <Icon /> component. */
    return (
      <Spinner
        isLoading
        {...pick(props, ["className", "style", "size"])}
        className={classNames(loadingClassName, props.className)}
      />
    );
  }
  const isVisible = hidden !== true && visible !== false;

  /* In the case that the 'icon' is explicitly provided, or the 'name' is explicitly provided, the
     icon being rendered is a Font Awesome icon (and not an internal SVG component). */
  if (icon !== undefined || name !== undefined) {
    /* If the icon is dynamic, it will not be included in the component's props as explicit parts
       (i.e. there will be an 'icon' prop, not 'name', 'family', and 'iconStyle' props). */
    if (icon !== undefined && iconIsDynamic(icon)) {
      return <DynamicIconRenderer icon={icon} {...props} />;
    } else if (isSvgIconProp(icon)) {
      if (!isVisible) {
        return <></>;
      }
      return (
        <Image
          className={classNames("icon", props.className)}
          style={{ ...props.style, ...getNativeIconStyle(props) }}
          src={icon}
          height={typeof props.size === "number" ? props.size : 16}
          width={typeof props.size === "number" ? props.size : 16}
          alt="Icon"
        />
      );
    }
    const ic = icon ?? { name, iconStyle, family };
    return (
      <NativeIcon
        {...props}
        isVisible={isVisible}
        className={getIconClassName({
          ...props,
          icon: ic,
        })}
      />
    );
  }
  // Here, the icon is an internal SVG component that is provided via the 'children' prop.
  return (
    <NativeIcon {...props} isVisible={isVisible} className={getInternalIconClassName(props)}>
      {children}
    </NativeIcon>
  );
};

export default Icon;
