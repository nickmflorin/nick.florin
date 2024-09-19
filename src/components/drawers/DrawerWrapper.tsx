import { type ReactNode } from "react";

import { useClickOutside } from "@mantine/hooks";
import { motion, AnimatePresence } from "framer-motion";

import { sizeToString } from "~/components/types";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

import { getDrawerWidth } from "./drawers";
import { type DrawerId } from "./types";

export interface DrawerWrapperProps {
  readonly drawerId: DrawerId | null;
  readonly children?: ReactNode;
  readonly onClose: () => void;
}

export const DrawerWrapper = ({ drawerId, children, onClose }: DrawerWrapperProps) => {
  const { isGreaterThan } = useScreenSizes();

  /* See note in MenuItem.tsx regarding the event propogation of touch start and mouse down events
     causing drawers to close for Select's that render their popover content in a portal. */
  const ref = useClickOutside(() => {
    if (!isGreaterThan("sm")) {
      onClose();
    }
  });
  const width = drawerId ? getDrawerWidth(drawerId) : undefined;

  return (
    <AnimatePresence>
      {children && (
        <motion.div
          ref={ref}
          transition={{ type: "spring", bounce: 0 }}
          className="drawer-wrapper"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          style={
            /* If the size is less than or equal to "sm", the width is set in SCSS based on the
               content viewport width. */
            isGreaterThan("sm") && width !== undefined
              ? {
                  width: sizeToString(width, "px"),
                  maxWidth: sizeToString(width, "px"),
                  minWidth: sizeToString(width, "px"),
                }
              : {}
          }
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
