import dynamic from "next/dynamic";
import { type ReactNode, memo } from "react";

const FloatingPortal = dynamic(() => import("@floating-ui/react").then(mod => mod.FloatingPortal));

export const ConditionalPortal = memo(
  ({ children, inPortal = false }: { inPortal?: boolean; children: ReactNode }) => {
    if (inPortal) {
      return <FloatingPortal>{children}</FloatingPortal>;
    }
    return children;
  },
);
