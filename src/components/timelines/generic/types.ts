"use client";
import { type ReactNode } from "react";

import { type ComponentProps } from "~/components/types";

export interface TimelineProps extends ComponentProps {
  readonly children: ReactNode[];
}
