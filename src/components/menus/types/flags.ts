import { type MenuModel, modelHasParam } from "./model";

const MenuItemFlagNames = ["isDisabled", "isLoading", "isVisible", "isLocked"] as const;

type MenuItemFlagName = (typeof MenuItemFlagNames)[number];

const MenuItemFlagMenuNames = {
  isDisabled: "itemIsDisabled",
  isLoading: "itemIsLoading",
  isVisible: "itemIsVisible",
  isLocked: "itemIsLocked",
} as const;

const MenuItemDefaultFlags = {
  isDisabled: false,
  isLoading: false,
  isVisible: true,
  isLocked: false,
};

type MenuItemFlagProp<M extends MenuModel> = (model: M) => boolean;

export type MenuItemFlagProps<M extends MenuModel> = {
  [key in MenuItemFlagName as (typeof MenuItemFlagMenuNames)[key]]?: MenuItemFlagProp<M>;
};

export const evalMenuItemFlag = <M extends MenuModel, F extends MenuItemFlagName>(
  flag: F,
  prop: MenuItemFlagProp<M> | undefined,
  model: M,
): boolean => {
  if (modelHasParam(model, flag)) {
    return model[flag];
  } else if (typeof prop === "function") {
    return prop(model);
  }
  return MenuItemDefaultFlags[flag];
};
