"use client";
import { useState } from "react";

import { useInterval } from "usehooks-ts";

export interface LoadingTextProps {
  readonly children?: string;
  readonly interval?: number;
  readonly isLoading?: boolean;
}

export const LoadingText = ({
  children = "",
  interval = 500,
  isLoading = true,
}: LoadingTextProps): JSX.Element => {
  const [numDots, setNumDots] = useState<number>(0);

  useInterval(
    () => {
      setNumDots(prev => (prev === 3 ? 0 : prev + 1));
    },
    isLoading ? interval : null,
  );

  return <>{isLoading ? children + ".".repeat(numDots) : children}</>;
};
