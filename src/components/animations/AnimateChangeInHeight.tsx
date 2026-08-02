import { type FC, type ReactNode, useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';

import { classNames, type ComponentProps } from '~/components/types';

export interface AnimateChangeInHeightProps extends ComponentProps {
  readonly children: ReactNode;
}

export const AnimateChangeInHeight: FC<AnimateChangeInHeightProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<'auto' | number>('auto');

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
      animate={{ height }}
      initial={{ height: 'auto' }}
      style={{ height }}
      transition={{ duration: 0.2 }}
    >
      <div className={classNames(className)} ref={containerRef}>
        {children}
      </div>
    </motion.div>
  );
};
