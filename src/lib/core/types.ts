import { type ReactNode, isValidElement } from "react";

import { z } from "zod";

export const isReactNode = (val: unknown): val is ReactNode => {
  if (Array.isArray(val)) {
    return val.every(v => ReactNodeSchema.safeParse(v).success);
  }
  if (
    typeof val === "boolean" ||
    typeof val === "string" ||
    typeof val === "number" ||
    val === null ||
    val === undefined
  ) {
    return true;
  } else if (isValidElement(val)) {
    return true;
  }
  return false;
};

export const ReactNodeSchema = z.custom<ReactNode>(isReactNode);
