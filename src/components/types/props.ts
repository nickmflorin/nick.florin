import type React from "react";

import { type ClassArray, type ClassValue } from "clsx";

export type ClassName = ClassValue | ClassArray;

export type ComponentProps = {
  readonly className?: ClassName;
  readonly style?: React.CSSProperties;
};
