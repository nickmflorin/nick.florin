"use client";
import { motion, AnimatePresence } from "framer-motion";

import { MobileNavigationCutoff } from "~/components/constants";
import { useNavMenu } from "~/hooks";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

export const LayoutMenuOverlay = () => {
  const { isLessThanOrEqualTo } = useScreenSizes();
  const { isOpen, close } = useNavMenu();

  if (isOpen && isLessThanOrEqualTo(MobileNavigationCutoff)) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            transition={{ type: "spring", bounce: 0 }}
            initial={{ opacity: "0%" }}
            animate={{ opacity: "50%" }}
            exit={{ opacity: "0%" }}
            className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-black z-10"
            onClick={() => close()}
          />
        )}
      </AnimatePresence>
    );
  }
  return <></>;
};
