import { useRef, useState, useEffect } from "react";

import { motion } from "framer-motion";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface AnimateChangeInHeightProps extends ComponentProps {
  children: React.ReactNode;
}

export const AnimateChangeInHeight: React.FC<AnimateChangeInHeightProps> = ({
  children,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        // We only have one entry, so we can use entries[0].
        const observedHeight = entries[0].contentRect.height;
        setHeight(observedHeight);
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        // Cleanup the observer when the component is unmounted
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <motion.div
      style={{ height }}
      initial={{ height: "auto" }}
      animate={{ height }}
      transition={{ duration: 0.2 }}
    >
      <div className={classNames(className)} ref={containerRef}>
        {children}
      </div>
    </motion.div>
  );
};
