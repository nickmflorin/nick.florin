"use client";
import type { ReactNode } from "react";

import { Loading } from "~/components/feedback/Loading";
import { useNavigation } from "~/hooks";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

export interface NavigatingProps {
  readonly children: ReactNode;
}

export const Navigating = ({ children }: NavigatingProps) => {
  const { isLessThanOrEqualTo } = useScreenSizes();
  const { pendingItem } = useNavigation();
  return (
    <Loading isLoading={pendingItem !== null && isLessThanOrEqualTo("450px")}>{children}</Loading>
  );
};
