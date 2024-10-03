import { forwardRef, useState } from "react";

import type { Optional } from "utility-types";

import type { IconProp, IconName } from "~/components/icons";
import Icon from "~/components/icons/Icon";
import { classNames as cs, type ComponentProps } from "~/components/types";

import { IconButton, type IconButtonProps } from "./generic";

export type FilterButtonInstance = HTMLButtonElement & {
  readonly clear: () => void;
  readonly setValue: (v: boolean | null) => void;
};

type FilterButtonState = "true" | "false" | "null";
type FilterButtonStateMap<T> = Optional<{ [key in FilterButtonState]: T }, "null">;

export interface FilterButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "scheme" | "variant"> {
  readonly initialValue: boolean | null;
  readonly classNames?: Partial<FilterButtonStateMap<ComponentProps["className"]>>;
  readonly icons: FilterButtonStateMap<IconProp | IconName>;
  readonly onChange?: (v: boolean | null) => void;
}

export const FilterButton = forwardRef<FilterButtonInstance, FilterButtonProps>(
  ({ initialValue, classNames, icons, onChange, ...props }, ref) => {
    const [value, setValue] = useState<boolean | null>(initialValue);

    return (
      <IconButton.Transparent
        {...props}
        ref={instance => {
          if (instance) {
            if (typeof ref === "function") {
              ref(
                Object.assign(instance, {
                  clear: () => setValue(null),
                  setValue: (v: boolean | null) => setValue(v),
                }),
              );
            } else if (ref) {
              ref.current = Object.assign(instance, {
                clear: () => setValue(null),
                setValue: (v: boolean | null) => setValue(v),
              });
            }
          }
        }}
        scheme="light"
        icon={
          <>
            <Icon
              icon={icons.null ?? icons.true}
              className={cs("text-disabled", classNames?.null ?? "", { hidden: value !== null })}
            />
            <Icon
              icon={icons.true}
              className={cs("text-blue-800", classNames?.true ?? "", { hidden: value !== true })}
            />
            <Icon
              icon={icons.false}
              className={cs("text-blue-800", classNames?.false ?? "", { hidden: value !== false })}
            />
          </>
        }
        className={cs("text-disabled", props.className, {
          [cs("text-disabled", classNames?.null ?? "")]: value === null,
          [cs("text-blue-800", classNames?.true ?? "")]: value === true,
          [cs("text-blue-800", classNames?.false ?? "")]: value === false,
        })}
        onClick={e => {
          props.onClick?.(e);
          setValue(curr => (curr === false ? null : curr === true ? false : true));
          onChange?.(value === null ? true : value === false ? null : false);
        }}
      />
    );
  },
);
