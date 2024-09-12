import type * as types from "../types";

import { classNames } from "~/components/types";
import { Label } from "~/components/typography";

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
  <div style={style} className={classNames("menu__item-group", className)}>
    {label && (
      <div className={classNames("menu__item-group__label", labelContainerClassName)}>
        {typeof label === "string" ? (
          <Label className={classNames("text-label-dark", labelClassName)} fontSize="sm">
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
