"use client";
import { motion } from "framer-motion";

import type { IconProp, IconName, IconSize } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { type ClassName, classNames, type ComponentProps } from "~/components/types";

export interface CaretIconProps
  extends ComponentProps,
    Omit<React.ComponentProps<typeof motion.div>, "animate" | "initial" | "className" | "style"> {
  readonly open: boolean;
  readonly icon?: IconProp | IconName;
  readonly size?: IconSize;
  readonly iconClassName?: ClassName;
}

export const CaretIcon = ({
  open,
  icon = "chevron-up",
  iconClassName,
  size,
  ...props
}: CaretIconProps) => (
  <motion.div
    {...props}
    key="0"
    initial={{ rotate: 0 }}
    animate={{ rotate: open ? 180 : 0 }}
    className={classNames(
      "flex flex-col items-center justify-center h-fit max-h-fit",
      props.className,
    )}
  >
    <Icon className={classNames("text-body", iconClassName)} icon={icon} size={size} />
  </motion.div>
);
