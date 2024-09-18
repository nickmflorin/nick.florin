"use client";
import { motion } from "framer-motion";

import type { Order } from "~/lib/ordering";

import type { IconProp, IconName, IconSize } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { type ClassName, classNames, type ComponentProps } from "~/components/types";

export interface SortIconProps
  extends ComponentProps,
    Omit<React.ComponentProps<typeof motion.div>, "animate" | "initial" | "className" | "style"> {
  readonly order: Order;
  readonly icon?: IconProp | IconName;
  readonly size?: IconSize;
  readonly iconClassName?: ClassName;
}

export const SortIcon = ({
  order,
  icon = "arrow-up",
  iconClassName,
  size,
  ...props
}: SortIconProps) => (
  <motion.div
    {...props}
    key="0"
    initial={{ rotate: 0 }}
    animate={{ rotate: order === "asc" ? 180 : 0 }}
    className={classNames(
      "flex flex-col items-center justify-center h-fit max-h-fit",
      props.className,
    )}
  >
    <Icon className={classNames("text-body", iconClassName)} icon={icon} size={size} />
  </motion.div>
);
