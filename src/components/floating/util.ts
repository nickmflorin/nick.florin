import { uniq } from "lodash-es";

import { humanizeList } from "~/lib/formatters";

export const mergeFloatingEventHandlers = (
  p1?: Record<string, unknown>,
  p2?: Record<string, unknown>,
): Record<string, unknown> => {
  const params1 = p1 ?? {};
  const params2 = p2 ?? {};

  const keys = uniq(Object.keys(params1).concat(Object.keys(params2)));

  const eventHandlerKeys = keys.filter(key => key.startsWith("on"));
  const otherKeys = keys.filter(key => !key.startsWith("on"));
  if (otherKeys.length !== 0) {
    const humanized = humanizeList(otherKeys, { conjunction: "and", formatter: v => `'${v}'` });
    throw new Error(
      `Encountered non-event handler key(s): ${humanized} when merging floating event handler parameters!`,
    );
  }
  let merged: Record<string, unknown> = {};
  for (const k of eventHandlerKeys) {
    const v1 = params1[k];
    const v2 = params2[k];
    if ((v1 && typeof v1 !== "function") || (v2 && typeof v2 !== "function")) {
      throw new Error(`Encountered non-function value for event handler key: '${k}'!`);
    }
    const fn1 = v1 as ((e: Event) => void) | undefined;
    const fn2 = v2 as ((e: Event) => void) | undefined;
    merged = {
      ...merged,
      [k]: (e: Event) => {
        fn1?.(e);
        fn2?.(e);
      },
    };
  }
  return merged;
};
