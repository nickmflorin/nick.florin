import { type CSSProperties, type RefObject } from "react";

import {
  type ReferenceType,
  type useInteractions,
  type UseClickProps,
  type UseHoverProps,
  type UseDismissProps,
  type UseRoleProps,
  type ExtendedRefs,
  type FloatingContext as RootFloatingContext,
} from "@floating-ui/react";

export type PopoverRenderProps = {
  readonly isOpen: boolean;
  readonly params: ReturnType<ReturnType<typeof useInteractions>["getReferenceProps"]>;
  readonly ref: (node: ReferenceType | null) => void;
};

export type FloatingContentRenderProps = {
  readonly isOpen: boolean;
  readonly params: Record<string, unknown>;
  readonly styles: CSSProperties;
  readonly setIsOpen: (
    v: boolean,
    evt: Event | React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
  ) => void;
  readonly ref: (node: HTMLElement | null) => void;
};

export type FloatingTriggerId = "hover" | "click" | "dismiss" | "role";

export type FloatingTriggerOptions<T extends FloatingTriggerId> = {
  hover: UseHoverProps;
  click: UseClickProps;
  dismiss: UseDismissProps;
  role: UseRoleProps;
}[T];

export type FloatingTriggerWithOptions<T extends FloatingTriggerId = FloatingTriggerId> =
  T extends FloatingTriggerId
    ? { readonly type: T; readonly options: Omit<FloatingTriggerOptions<T>, "enabled"> }
    : never;

export type FloatingTrigger<T extends FloatingTriggerId = FloatingTriggerId> =
  T extends FloatingTriggerId ? T | FloatingTriggerWithOptions<T> : never;

export const hasFloatingTrigger = (triggers: FloatingTrigger[], id: FloatingTriggerId): boolean => {
  const ts = triggers.map(t => (typeof t === "string" ? t : t.type));
  return ts.includes(id);
};

export const parseFloatingTriggerOptions = <T extends FloatingTriggerId>(
  triggers: FloatingTrigger[],
  id: T,
): FloatingTriggerOptions<T> => {
  const ts = triggers.map(t => (typeof t === "string" ? { type: t, options: {} } : t));
  const filtered = ts.filter(t => t.type === id);
  if (filtered.length === 0) {
    return { enabled: false };
  } else if (filtered.length === 1) {
    return filtered[0].options;
  }
  throw new Error(`Multiple triggers of the same type '${id}' encountered!`);
};

export interface FloatingContext {
  readonly isOpen: boolean;
  readonly referenceProps: Record<string, unknown>;
  readonly floatingProps: Record<string, unknown>;
  readonly floatingStyles: React.CSSProperties;
  readonly context: RootFloatingContext;
  readonly refs: ExtendedRefs<ReferenceType>;
  readonly setIsOpen: (
    v: boolean,
    evt: Event | React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
  ) => void;
}

export interface PopoverContext extends FloatingContext {
  readonly arrowRef: RefObject<SVGSVGElement>;
}

export type PopoverContentRenderFn = (props: FloatingContentRenderProps) => JSX.Element;

export type PopoverContent = JSX.Element | PopoverContentRenderFn;
