import clsx from "clsx";

import type * as types from "../types";

import { singleTextNodeCanRender } from "~/components/types/typography";
import { Label } from "~/components/typography/Label";

import { MenuContent } from "./MenuContent";
import { MenuContentWrapper } from "./MenuContentWrapper";

export const MenuItemGroup = <M extends types.MenuModel, O extends types.MenuOptions<M>>({
  contentIsLoading,
  label,
  labelClassName,
  labelContainerClassName,
  className,
  style,
  ...props
}: types.MenuItemGroupProps<M, O>): JSX.Element => (
  <div style={style} className={clsx("menu__item-group", className)}>
    {singleTextNodeCanRender(label) && (
      <div className={clsx("menu__item-group__label", labelContainerClassName)}>
        {typeof label === "string" ? (
          <Label dark className={labelClassName} fontSize="sm">
            {label}
          </Label>
        ) : (
          label
        )}
      </div>
    )}
    <MenuContentWrapper contentIsLoading={contentIsLoading}>
      <MenuContent {...props} />
    </MenuContentWrapper>
  </div>
);

export default MenuItemGroup;
