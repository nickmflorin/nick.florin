"use client";
import { type ReactNode, useEffect, useState } from "react";

import { Portal } from "@mui/base/Portal";

export interface TableControlBarPortalProps {
  readonly children?: ReactNode;
  readonly targetId?: string | null;
}

export const TableControlBarPortal = ({
  children,
  targetId,
}: TableControlBarPortalProps): JSX.Element => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (targetId) {
      setContainer(document.getElementById(targetId));
    }
  }, [targetId]);

  if (targetId) {
    return <Portal container={container}>{children}</Portal>;
  }
  return <>{children}</>;
};
