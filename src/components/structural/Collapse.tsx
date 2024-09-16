import React, { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { CaretIcon } from "~/components/icons/CaretIcon";
import { Actions, type Action } from "~/components/structural/Actions";
import type { ClassName, ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";
import { Text, type TextProps } from "~/components/typography";

export interface CollapseProps extends ComponentProps {
  readonly isOpen?: boolean;
  readonly initiallyOpen?: boolean;
  readonly children: React.ReactNode;
  readonly actions?: Action[] | ((params: { isOpen: boolean }) => Action[]);
  readonly title?: string | JSX.Element;
  readonly contentClassName?: ClassName;
  readonly enabled?: boolean;
  readonly openClassName?: ClassName;
  readonly closedClassName?: ClassName;
  readonly headerClassName?: ClassName;
  readonly titleProps?: Omit<TextProps<"div">, "children" | "ref">;
  readonly onOpenChange?: (isOpen: boolean) => void;
}

export const Collapse = ({
  isOpen: _isOpen,
  initiallyOpen = true,
  actions = [],
  title,
  children,
  contentClassName,
  headerClassName,
  enabled = true,
  openClassName,
  closedClassName,
  titleProps,
  onOpenChange,
  ...props
}: CollapseProps): JSX.Element => {
  const [_open, setOpen] = useState(initiallyOpen && enabled);

  const isOpen = _isOpen ?? _open;

  return (
    <div
      {...props}
      className={classNames(
        "collapseable",
        openClassName && isOpen,
        closedClassName && !isOpen,
        props.className,
      )}
    >
      <div
        className={classNames("collapse__header", headerClassName)}
        onClick={() => {
          if (enabled) {
            setOpen(curr => !curr);
            onOpenChange?.(!isOpen);
          }
        }}
      >
        <div className="collapse__title">
          {typeof title === "string" ? <Text {...titleProps}>{title}</Text> : title}
        </div>
        <div className="collapse__affixes">
          <Actions actions={typeof actions === "function" ? actions({ isOpen }) : actions} />
          <CaretIcon key={actions.length + 1} open={isOpen} className="h-[14px]" />
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={classNames("collapse__content", contentClassName)}
            initial={{ opacity: 0, height: 0 }}
            animate={isOpen ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
