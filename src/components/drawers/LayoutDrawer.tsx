"use client";
import { useClickOutside } from "@mantine/hooks";
import { motion, AnimatePresence } from "framer-motion";

import { useDrawers } from "~/components/drawers/hooks/use-drawers";

export const LayoutDrawer = () => {
  const { drawer, close } = useDrawers();
  const ref = useClickOutside(() => close());

  return (
    <AnimatePresence>
      {drawer && (
        <motion.div
          ref={ref}
          transition={{ type: "spring", bounce: 0 }}
          className="drawer-wrapper"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
        >
          {drawer}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LayoutDrawer;