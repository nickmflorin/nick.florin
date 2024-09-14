"use client";
import type { ReactNode } from "react";

import { useClickOutside } from "@mantine/hooks";
import { motion, AnimatePresence } from "framer-motion";

import { useNavMenu } from "~/hooks";

export interface LayoutMenuWrapperProps {
  readonly children: ReactNode;
}

export const LayoutMenuWrapper = ({ children }: LayoutMenuWrapperProps) => {
  const { isOpen, close } = useNavMenu();
  const ref = useClickOutside(() => close());

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          transition={{ type: "spring", bounce: 0 }}
          className="layout-menu-wrapper"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
        >
          <div className="layout-menu-container">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
