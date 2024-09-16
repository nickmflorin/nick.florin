"use client";
import type { ReactNode } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { useNavMenu } from "~/hooks";

export interface SiteMenuWrapperProps {
  readonly children: ReactNode;
}

export const SiteNavMenuWrapper = ({ children }: SiteMenuWrapperProps) => {
  const { isOpen } = useNavMenu();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          transition={{ type: "spring", bounce: 0 }}
          className="site-nav-menu-wrapper"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
        >
          <div className="site-nav-menu-container">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
