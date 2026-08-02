import { Fragment, type JSX, memo, type ReactNode, useMemo } from 'react';

import { Badge, type BadgeProps } from '~/components/badges/Badge';
import { type IconName, type IconProp } from '~/components/icons';

import { MultiValueRendererContainer } from './MultiValueRendererContainer';
import { TruncatedMultiValueRenderer } from './TruncatedMultiValueRenderer';

type MultiValueRendererChild = JSX.Element | number | string;

type MultiValueRendererModel = {
  readonly content?: ReactNode;
  readonly icon?: IconName | IconProp | JSX.Element;
  readonly id?: number | string;
  readonly label?: ReactNode;
};

interface MultiValueRendererBaseProps {
  readonly hasDynamicHeight?: boolean;
  readonly maximumValuesToRender?: number;
}

export interface MultiValueRendererCallbackProps<
  T extends MultiValueRendererModel,
> extends MultiValueRendererBaseProps {
  readonly badgeProps?: Omit<BadgeProps, 'children' | 'icon' | 'onClose' | 'size'>;
  readonly children?: never;
  readonly chipClassName?: BadgeProps['className'];
  readonly chipSize?: BadgeProps['size'];
  readonly data: T[];
  readonly getBadgeIcon?: (m: T) => IconName | IconProp | JSX.Element | undefined;
  readonly getBadgeLabel?: (m: T) => ReactNode;
  readonly getBadgeProps?: (
    m: T,
  ) => Partial<Omit<BadgeProps, 'children' | 'icon' | 'onClose'>> | undefined;
  readonly onBadgeClose?: (m: T) => void;
  readonly renderer?: (m: T) => JSX.Element;
  readonly summarizeValue?: boolean;
  readonly summarizeValueAfter?: number;
  readonly valueSummary?: ((params: { count: number }) => ReactNode) | ReactNode;
}

export interface MultiValueRendererChildrenProps extends MultiValueRendererBaseProps {
  readonly badgeProps?: never;
  readonly children: MultiValueRendererChild | MultiValueRendererChild[];
  readonly chipClassName?: never;
  readonly chipSize?: never;
  readonly data?: never;
  readonly getBadgeIcon?: never;
  readonly getBadgeLabel?: never;
  readonly getBadgeProps?: never;
  readonly onBadgeClose?: never;
  readonly renderer?: never;
  readonly summarizeValue?: boolean;
  readonly summarizeValueAfter?: number;
  readonly valueSummary?: ((params: { count: number }) => ReactNode) | ReactNode;
}

export type MultiValueRendererProps<T extends MultiValueRendererModel> =
  MultiValueRendererCallbackProps<T> | MultiValueRendererChildrenProps;

export const MultiValueRenderer = memo(
  <T extends MultiValueRendererModel>({
    badgeProps,
    children,
    chipClassName,
    chipSize = 'sm',
    data,
    getBadgeIcon,
    getBadgeLabel,
    getBadgeProps,
    hasDynamicHeight = true,
    maximumValuesToRender,
    onBadgeClose,
    renderer,
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
          } else if ('valueLabel' in model && model.label !== undefined) {
            label = model.label;
          }
          let icon: IconName | IconProp | JSX.Element | undefined = undefined;
          if (getBadgeIcon) {
            icon = getBadgeIcon(model);
          }
          if (!icon && 'icon' in model && model.icon !== undefined) {
            icon = model.icon;
          }
          return (
            <Badge
              {...badgeProps}
              className={chipClassName}
              size={chipSize}
              {...getBadgeProps?.(model)}
              icon={icon}
              key={i}
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
          <MultiValueRendererContainer hasDynamicHeight={hasDynamicHeight}>
            {_children.map((child, i) => (
              <Fragment key={i}>{child}</Fragment>
            ))}
          </MultiValueRendererContainer>
        )}
      </TruncatedMultiValueRenderer>
    );
  },
) as <T extends MultiValueRendererModel>(props: MultiValueRendererProps<T>) => JSX.Element;
