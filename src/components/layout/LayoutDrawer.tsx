"use client";
import { motion, AnimatePresence } from "framer-motion";

import { useDrawers } from "~/components/drawers/hooks";

export const LayoutDrawer = () => {
  const { drawer } = useDrawers();

  return (
    <AnimatePresence>
      {drawer && (
        <motion.div
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
