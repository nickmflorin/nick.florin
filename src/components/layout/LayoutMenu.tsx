"use client";
import { motion, AnimatePresence } from "framer-motion";

import { useNavMenu } from "~/hooks";

export const LayoutMenu = () => {
  const { isOpen } = useNavMenu();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          transition={{ type: "spring", bounce: 0 }}
          className="drawer-wrapper"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
        >
          <div>Test</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LayoutMenu;
