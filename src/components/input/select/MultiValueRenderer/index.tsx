import React, { useMemo, memo, type ReactNode } from "react";

import { Badge, type BadgeProps } from "~/components/badges/Badge";
import { type IconProp, type IconName } from "~/components/icons";

import { MultiValueRendererContainer } from "./MultiValueRendererContainer";
import { TruncatedMultiValueRenderer } from "./TruncatedMultiValueRenderer";

type MultiValueRendererChild = string | number | JSX.Element;

type MultiValueRendererModel = {
  readonly id?: string | number;
  readonly icon?: IconProp | IconName | JSX.Element;
  readonly label?: ReactNode;
  readonly content?: ReactNode;
  [key: string]: unknown;
};

interface MultiValueRendererBaseProps {
  readonly maximumValuesToRender?: number;
  readonly dynamicHeight?: boolean;
}

export interface MultiValueRendererCallbackProps<T extends MultiValueRendererModel>
  extends MultiValueRendererBaseProps {
  readonly data: T[];
  readonly children?: never;
  readonly summarizeValueAfter?: number;
  readonly summarizeValue?: boolean;
  readonly valueSummary?: ReactNode | ((params: { count: number }) => ReactNode);
  readonly chipClassName?: BadgeProps["className"];
  readonly chipSize?: BadgeProps["size"];
  readonly badgeProps?: Omit<BadgeProps, "children" | "icon" | "size" | "onClose">;
  readonly onBadgeClose?: (m: T) => void;
  readonly getBadgeLabel?: (m: T) => ReactNode;
  readonly getBadgeIcon?: (m: T) => IconProp | IconName | JSX.Element | undefined;
  readonly getBadgeProps?: (
    m: T,
  ) => Partial<Omit<BadgeProps, "children" | "icon" | "onClose">> | undefined;
  readonly renderer?: (m: T) => JSX.Element;
}

export interface MultiValueRendererChildrenProps extends MultiValueRendererBaseProps {
  readonly chipClassName?: never;
  readonly chipSize?: never;
  readonly badgeProps?: never;
  readonly summarizeValueAfter?: number;
  readonly summarizeValue?: boolean;
  readonly valueSummary?: ReactNode | ((params: { count: number }) => ReactNode);
  readonly children: MultiValueRendererChild | MultiValueRendererChild[];
  readonly data?: never;
  readonly getBadgeLabel?: never;
  readonly getBadgeIcon?: never;
  readonly renderer?: never;
  readonly onBadgeClose?: never;
  readonly getBadgeProps?: never;
}

export type MultiValueRendererProps<T extends MultiValueRendererModel> =
  | MultiValueRendererChildrenProps
  | MultiValueRendererCallbackProps<T>;

export const MultiValueRenderer = memo(
  <T extends MultiValueRendererModel>({
    maximumValuesToRender,
    dynamicHeight = true,
    data,
    children,
    chipSize = "sm",
    chipClassName,
    badgeProps,
    onBadgeClose,
    renderer,
    getBadgeLabel,
    getBadgeIcon,
    getBadgeProps,
    ...props
  }: MultiValueRendererProps<T>) => {
    const content = useMemo<MultiValueRendererChild[]>(() => {
      if (children) {
        return Array.isArray(children) ? children : [children];
      } else if (data) {
        return data.map((model, i) => {
          if (renderer) {
            return renderer(model);
          }
          let label: ReactNode | undefined = undefined;
          if (getBadgeLabel) {
            label = getBadgeLabel(model);
          } else if ("valueLabel" in model && model.label !== undefined) {
            label = model.label;
          }
          let icon: IconProp | IconName | JSX.Element | undefined = undefined;
          if (getBadgeIcon) {
            icon = getBadgeIcon(model);
          }
          if (!icon && "icon" in model && model.icon !== undefined) {
            icon = model.icon;
          }
          return (
            <Badge
              {...badgeProps}
              size={chipSize}
              className={chipClassName}
              {...getBadgeProps?.(model)}
              key={i}
              icon={icon}
              onClose={onBadgeClose ? () => onBadgeClose(model) : undefined}
            >
              {label}
            </Badge>
          );
        });
      }
      return [];
    }, [
      data,
      children,
      badgeProps,
      chipClassName,
      chipSize,
      onBadgeClose,
      getBadgeIcon,
      getBadgeLabel,
      getBadgeProps,
      renderer,
    ]);

    return (
      <TruncatedMultiValueRenderer
        {...props}
        content={content}
        maximumValuesToRender={maximumValuesToRender}
      >
        {({ children: _children }) => (
          <MultiValueRendererContainer dynamicHeight={dynamicHeight}>
            {_children.map((child, i) => (
              <React.Fragment key={i}>{child}</React.Fragment>
            ))}
          </MultiValueRendererContainer>
        )}
      </TruncatedMultiValueRenderer>
    );
  },
) as {
  <T extends MultiValueRendererModel>(props: MultiValueRendererProps<T>): JSX.Element;
};

export default MultiValueRenderer;
