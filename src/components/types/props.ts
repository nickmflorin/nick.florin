import type React from "react";

import { type ClassName } from "./classes";

export type Style = React.CSSProperties;

export type ComponentProps = {
  readonly className?: ClassName;
  readonly style?: Style;
};
