import { type CSSProperties, type Dispatch, type RefObject, type SetStateAction } from "react";

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
import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

import { classNames, type ComponentProps, type ClassName } from "~/components/types";

export const PopoverVariants = enumeratedLiterals(
  ["primary", "secondary", "light", "white", "none"] as const,
  {},
);
export type PopoverVariant = EnumeratedLiteralsMember<typeof PopoverVariants>;

export const PopoverVariantClassNames: {
  [key in PopoverVariant]: (cs?: ComponentProps["className"]) => string;
} = {
  [PopoverVariants.PRIMARY]: cs => classNames("text-white", "bg-blue-500", "shadow-md", cs),
  [PopoverVariants.LIGHT]: cs => classNames("text-text", "bg-gray-50", "shadow-md", cs),
  [PopoverVariants.SECONDARY]: cs =>
    classNames("text-heading", "bg-gradient-to-r from-gray-50 to-gray-200", "shadow-md", cs),
  [PopoverVariants.WHITE]: cs => classNames("text-text", "bg-white", "shadow-md", cs),
  [PopoverVariants.NONE]: cs => classNames(cs),
};

export const PopoverVariantArrowClassNames: { [key in PopoverVariant]: string } = {
  [PopoverVariants.PRIMARY]: classNames(
    "fill-blue-500",
    "[&>path:first-of-type]:stroke-blue-500",
    "[&>path:last-of-type]:stroke-blue-500",
  ),
  [PopoverVariants.LIGHT]: classNames(
    "fill-gray-50",
    "[&>path:first-of-type]:stroke-gray-50",
    "[&>path:last-of-type]:stroke-gray-50",
  ),
  [PopoverVariants.SECONDARY]: classNames(
    "fill-gray-200",
    "[&>path:first-of-type]:stroke-gray-200",
    "[&>path:last-of-type]:stroke-gray-200",
  ),
  [PopoverVariants.WHITE]: classNames(
    "fill-white",
    "[&>path:first-of-type]:stroke-white",
    "[&>path:last-of-type]:stroke-white",
  ),
  [PopoverVariants.NONE]: "",
};

export const getPopoverVariantClassName = (
  variant: PopoverVariant,
  className?: ClassName,
): string => PopoverVariantClassNames[variant](className);

export const getPopoverArrowVariantClassName = (variant: PopoverVariant): string =>
  PopoverVariantArrowClassNames[variant];

export type PopoverRenderProps = {
  readonly isOpen: boolean;
  readonly params: ReturnType<ReturnType<typeof useInteractions>["getReferenceProps"]>;
  readonly ref: (node: ReferenceType | null) => void;
};

export type FloatingContentRenderProps = {
  readonly params: Record<string, unknown>;
  readonly styles: CSSProperties;
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
  readonly setIsOpen: (v: boolean, evt: Event | React.MouseEvent<HTMLButtonElement>) => void;
}

export interface PopoverContext extends FloatingContext {
  readonly arrowRef: RefObject<SVGSVGElement>;
}

export interface DialogContext extends FloatingContext {
  readonly titleId: string | undefined;
  readonly contentId: string | undefined;
  readonly setTitleId: Dispatch<SetStateAction<string | undefined>>;
  readonly setContentId: Dispatch<SetStateAction<string | undefined>>;
}
