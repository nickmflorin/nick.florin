import { type CSSProperties, type JSX, type MouseEvent, type RefObject } from 'react';

import {
  type ExtendedRefs,
  type ReferenceType,
  type FloatingContext as RootFloatingContext,
  type UseClickProps,
  type UseDismissProps,
  type UseHoverProps,
  type useInteractions,
  type UseRoleProps,
} from '@floating-ui/react';

export type PopoverRenderProps = {
  readonly isOpen: boolean;
  readonly params: ReturnType<ReturnType<typeof useInteractions>['getReferenceProps']>;
  readonly ref: (node: null | ReferenceType) => void;
};

export type FloatingContentRenderProps = {
  readonly isOpen: boolean;
  readonly params: Record<string, unknown>;
  readonly ref: (node: HTMLElement | null) => void;
  readonly setIsOpen: (
    v: boolean,
    evt: Event | MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>,
  ) => void;
  readonly styles: CSSProperties;
};

export type FloatingTriggerId = 'click' | 'dismiss' | 'hover' | 'role';

export type FloatingTriggerOptions<T extends FloatingTriggerId> = {
  click: UseClickProps;
  dismiss: UseDismissProps;
  hover: UseHoverProps;
  role: UseRoleProps;
}[T];

export type FloatingTriggerWithOptions<T extends FloatingTriggerId = FloatingTriggerId> =
  T extends FloatingTriggerId
    ? { readonly options: Omit<FloatingTriggerOptions<T>, 'enabled'>; readonly type: T }
    : never;

export type FloatingTrigger<T extends FloatingTriggerId = FloatingTriggerId> =
  T extends FloatingTriggerId ? FloatingTriggerWithOptions<T> | T : never;

export const hasFloatingTrigger = (triggers: FloatingTrigger[], id: FloatingTriggerId): boolean => {
  const ts = triggers.map(t => (typeof t === 'string' ? t : t.type));
  return ts.includes(id);
};

export const parseFloatingTriggerOptions = <T extends FloatingTriggerId>(
  triggers: FloatingTrigger[],
  id: T,
): FloatingTriggerOptions<T> => {
  const ts = triggers.map(t => (typeof t === 'string' ? { options: {}, type: t } : t));
  const filtered = ts.filter(t => t.type === id);
  if (filtered.length === 0) {
    return { enabled: false };
  } else if (filtered.length === 1) {
    return filtered[0].options;
  }
  throw new Error(`Multiple triggers of the same type '${id}' encountered!`);
};

export interface FloatingContext {
  readonly context: RootFloatingContext;
  readonly floatingProps: Record<string, unknown>;
  readonly floatingStyles: CSSProperties;
  readonly isOpen: boolean;
  readonly referenceProps: Record<string, unknown>;
  readonly refs: ExtendedRefs<ReferenceType>;
  readonly setIsOpen: (
    v: boolean,
    evt: Event | MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>,
  ) => void;
}

export interface PopoverContext extends FloatingContext {
  /**
   * React 19 changed `useRef<T>(null)` to produce a `RefObject<T | null>`, so the nullability has
   * to be reflected here.
   */
  readonly arrowRef: RefObject<null | SVGSVGElement>;
}

export type PopoverContentRenderFn = (props: FloatingContentRenderProps) => JSX.Element | null;

export type PopoverContent = JSX.Element | PopoverContentRenderFn;

export type PopoverOuterContentRenderFn = (
  props: { readonly children: JSX.Element } & FloatingContentRenderProps,
) => JSX.Element;

export type PopoverOuterContent = PopoverOuterContentRenderFn;
