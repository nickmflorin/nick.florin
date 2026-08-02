import {
  type CSSProperties,
  type ComponentProps as ReactComponentProps,
  type ReactNode,
} from 'react';

import { omit, pick } from 'lodash-es';

import { UnreachableCaseError } from '~/application/errors';
import { logger } from '~/internal/logger';

import {
  classNames,
  type ComponentProps,
  parseDataAttributes,
  type QuantitativeSize,
  sizeToString,
} from '~/components/types';

export type ViewPosition = 'absolute' | 'fixed' | 'relative';
export type ViewOverflow = 'auto' | 'hidden' | 'scroll' | 'visible';
export type ViewFill = 'parent' | 'screen';

export type ViewComponent = 'div' | 'tbody' | 'tr';

const ViewSizePropNames = [
  'height',
  'width',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
] as const;

export type ViewSizePropName = (typeof ViewSizePropNames)[number];

export type ViewSizeProps = Partial<Record<ViewSizePropName, QuantitativeSize<'px'> | ViewFill>>;

export type ViewPositionProps = Partial<{
  readonly absolute: true;
  readonly fixed: true;
  readonly position: ViewPosition;
  readonly relative: true;
}>;

export type ViewOverflowProps = Partial<{
  readonly overflow: ViewOverflow;
  readonly overflowX: ViewOverflow;
  readonly overflowY: ViewOverflow;
}>;

export type ViewFillProps = Partial<{
  readonly fill: null | ViewFill;
  readonly fillParent: true;
  readonly fillScreen: true;
}>;

export type ViewFlexProps = Partial<{
  readonly centerChildren: true;
  readonly column: true;
  readonly flex: boolean;
  readonly grow: true;
  readonly orientation: 'column' | 'row';
  readonly row: true;
}>;

type ViewInternalProps = {
  readonly __default_position__?: ViewPosition;
  readonly children?: ReactNode;
  readonly dim?: true;
  readonly dimIfDisabled?: false;
  readonly isDisabled?: true;
} & ComponentProps &
  ViewFillProps &
  ViewFlexProps &
  ViewOverflowProps &
  ViewPositionProps &
  ViewSizeProps;

export const ViewInternalPropsMap = {
  /* eslint-disable-next-line camelcase -- The underscores intentionally mark this as an
     internal, non-public prop. */
  __default_position__: true,
  absolute: true,
  centerChildren: true,
  children: true,
  className: true,
  column: true,
  dim: true,
  dimIfDisabled: true,
  fill: true,
  fillParent: true,
  fillScreen: true,
  fixed: true,
  flex: true,
  grow: true,
  height: true,
  isDisabled: true,
  maxHeight: true,
  maxWidth: true,
  minHeight: true,
  minWidth: true,
  orientation: true,
  overflow: true,
  overflowX: true,
  overflowY: true,
  position: true,
  relative: true,
  row: true,
  style: true,
  width: true,
} as const satisfies {
  [key in keyof Required<ViewInternalProps>]: true;
};

export const omitViewInternalProps = <P extends Record<string, unknown>>(
  props: P,
): Omit<P, keyof P & keyof typeof ViewInternalPropsMap> =>
  omit(props, Object.keys(ViewInternalPropsMap) as (keyof Required<ViewInternalProps>)[]);

export const pickViewInternalProps = <P extends Record<string, unknown>>(
  props: P,
): Pick<P, keyof P & keyof typeof ViewInternalPropsMap> =>
  pick(props, Object.keys(ViewInternalPropsMap) as (keyof Required<ViewInternalProps>)[]);

export type ViewProps<C extends ViewComponent> = {
  readonly component?: C;
} & Omit<ReactComponentProps<C>, keyof ViewInternalProps> &
  ViewInternalProps;

const parseFlex = <C extends ViewComponent>({
  centerChildren,
  column,
  flex = true,
  grow,
  orientation,
  row,
}: Pick<
  ViewProps<C>,
  'centerChildren' | 'column' | 'flex' | 'grow' | 'orientation' | 'row'
>): string => {
  if (centerChildren) {
    return classNames('flex', 'flex-col', 'items-center', 'justify-center', { grow });
  } else if (flex) {
    if (orientation) {
      if (row || column) {
        logger.warn(
          "The props 'row' and/or 'column' should not be specified on a view when the " +
            "'orientation' prop is explicitly defined.",
          { column, orientation, row },
        );
      }
      return classNames('flex', {
        'flex-col': orientation === 'column',
        'flex-row': orientation === 'row',
        grow,
      });
    } else if (row && column) {
      logger.warn(
        "The props 'row' and 'column' should not both be specified on a view at the " +
          "same time.  The 'column' prop will take precedence.",
        { column, orientation, row },
      );
      return classNames('flex', 'flex-col', { grow });
    }
    return classNames('flex', { 'flex-col': column ?? row === undefined, 'flex-row': row, grow });
  }
  return '';
};

const parsePosition = <C extends ViewComponent>({
  __default_position__,
  absolute,
  fixed,
  position,
  relative,
}: Pick<
  ViewProps<C>,
  '__default_position__' | 'absolute' | 'fixed' | 'position' | 'relative'
>): ViewPosition => {
  if (position !== undefined) {
    if (absolute !== undefined || relative !== undefined || fixed !== undefined) {
      logger.warn(
        "The props 'absolute', 'relative' and/or 'fixed' should not be specified on a view when " +
          "the 'position' prop is explicitly defined.",
        { absolute, fixed, position, relative },
      );
    }
    return position;
  } else if (absolute !== undefined) {
    if (relative || fixed) {
      logger.warn(
        "The prop 'absolute' should not be specified at the same time as the props " +
          "'relative' or 'fixed'. The 'absolute' prop will take precedence.",
        { absolute, position, relative },
      );
    }
    return 'absolute';
  } else if (relative !== undefined) {
    if (fixed) {
      logger.warn(
        "The prop 'relative' should not be specified at the same time as the prop " +
          "'fixed'. The 'relative' prop will take precedence.",
        { absolute, fixed, position, relative },
      );
    }
    return 'relative';
  } else if (fixed !== undefined) {
    return 'fixed';
  }
  /* eslint-disable-next-line camelcase -- The underscores intentionally mark this as an
     internal, non-public prop. */
  return __default_position__ ?? 'relative';
};

const parseFill = <C extends ViewComponent>({
  fill,
  fillParent,
  fillScreen,
}: Pick<ViewProps<C>, 'fill' | 'fillParent' | 'fillScreen'>): null | ViewFill => {
  if (fill !== undefined) {
    if (fillParent !== undefined || fillScreen !== undefined) {
      logger.warn(
        "The props 'fillParent' and 'fillScreen' should not be specified on a view when the " +
          "'fill' prop is explicitly defined.",
        { fill, fillParent, fillScreen },
      );
    }
    return fill;
  } else if (fillScreen) {
    if (fillParent) {
      logger.warn(
        "The props 'fillScreen' and 'fillParent' should not both be specified on a view at the " +
          "same time.  The 'fillParent' prop will take precedence.",
        { fill, fillParent, fillScreen },
      );
      return 'parent';
    }
    return 'screen';
  } else if (fillParent) {
    return 'parent';
  }
  return null;
};

const OverflowClassName = (overflow: ViewOverflow) =>
  classNames({
    'overflow-auto': overflow === 'auto',
    'overflow-hidden': overflow === 'hidden',
    'overflow-scroll': overflow === 'scroll',
    'overflow-visible': overflow === 'visible',
  });

const OverflowXClassName = (overflow: ViewOverflow) =>
  classNames({
    'overflow-x-auto': overflow === 'auto',
    'overflow-x-hidden': overflow === 'hidden',
    'overflow-x-scroll': overflow === 'scroll',
    'overflow-x-visible': overflow === 'visible',
  });

const OverflowYClassName = (overflow: ViewOverflow) =>
  classNames({
    'overflow-y-auto': overflow === 'auto',
    'overflow-y-hidden': overflow === 'hidden',
    'overflow-y-scroll': overflow === 'scroll',
    'overflow-y-visible': overflow === 'visible',
  });

const parseOverflow = <C extends ViewComponent>({
  overflow,
  overflowX,
  overflowY,
}: Pick<ViewProps<C>, 'overflow' | 'overflowX' | 'overflowY'>): string => {
  if (overflow !== undefined) {
    if (overflowX !== undefined || overflowY !== undefined) {
      logger.warn(
        "The props 'overflowX' and 'overflowY' should not be specified on a view when the " +
          "'overflow' prop is explicitly defined.",
        { overflow, overflowX, overflowY },
      );
    }
    return classNames(OverflowClassName(overflow));
  } else if (overflowX && overflowY) {
    return classNames(OverflowXClassName(overflowX), OverflowYClassName(overflowY));
  } else if (overflowX) {
    return OverflowXClassName(overflowX);
  } else if (overflowY) {
    return OverflowYClassName(overflowY);
  }
  return OverflowClassName('hidden');
};

/**
 * Suppresses the console warning that React issues when the `<Loading />` component, rendered as a
 * `<tr>` element, places its loading indicator (an `<i>` element) inside of the `<tr>` element:
 *
 * `Warning: validateDOMNesting(...): <i> cannot appear as a child of <tr>.`
 *
 * There does not seem to be anything critically, or even mildly, problematic with the inclusion of
 * an `<i>` element inside of the `<tr>` element - everything seems to work as expected. This is
 * assumed to be React being over-sensitive about the structure of the DOM, so the warning is
 * ignored manually here.
 */
/* eslint-disable-next-line no-console */
const consoleError = console.error;

/* eslint-disable-next-line no-console */
console.error = (msg: unknown, ...args: unknown[]) => {
  if (
    typeof msg === 'string' &&
    (msg.includes('validateDOMNesting(...)') || msg.includes('In HTML')) &&
    args.length >= 2 &&
    args[0] === '<i>' &&
    typeof args[1] === 'string' &&
    ['tbody', 'tr'].includes(args[1])
  ) {
    return;
  } else if (
    typeof msg === 'string' &&
    msg.includes('Warning: In HTML, <i> cannot be a child of <tbody>.')
  ) {
    return;
  }
  consoleError(msg, ...args);
};

const getViewStyle = <C extends ViewComponent>(
  props: Pick<ViewProps<C>, 'style' | ViewSizePropName>,
) =>
  ViewSizePropNames.reduce((prev: CSSProperties, key: ViewSizePropName) => {
    const size = props[key];
    if (size !== 'parent' && size !== 'screen' && size !== undefined) {
      return { ...prev, [key]: sizeToString(size, 'px') };
    }
    return prev;
  }, props.style ?? {});

export const View = <C extends ViewComponent>({
  children,
  component = 'div' as C,
  ...props
}: ViewProps<C>) => {
  const _fill = parseFill(props);
  const _position = parsePosition(props);

  const ps = {
    ...omitViewInternalProps(props),
    className: classNames(
      'view',
      _position,
      parseOverflow(props),
      parseFlex(props),
      {
        'h-full': _fill === 'parent' || props.height === 'parent',
        'left-0 top-0': _fill !== null && _position === 'absolute',
        'max-h-full': props.maxHeight === 'parent',
        'max-w-full': props.maxWidth === 'parent',
        'min-h-full': props.minHeight === 'parent',
        'min-w-full': props.minWidth === 'parent',
        'opacity-30': props.dim ?? (props.dimIfDisabled !== false && props.isDisabled),
        'pointer-events-none': props.isDisabled,
        'w-full': _fill === 'parent' || props.width === 'parent',
      },
      props.className,
    ),
    style: getViewStyle(props),
  } as Omit<ReactComponentProps<C>, 'ref'>;

  const p = {
    ...ps,
    ...parseDataAttributes({
      screenH: _fill === 'screen' || props.height === 'screen',
      screenW: _fill === 'screen' || props.width === 'screen',
    }),
  };

  switch (component) {
    case 'div':
      return <div {...p}>{children}</div>;
    case 'tbody':
      return <tbody {...(p as ReactComponentProps<'tbody'>)}>{children}</tbody>;
    case 'tr':
      return <tr {...(p as ReactComponentProps<'tr'>)}>{children}</tr>;
    default:
      throw new UnreachableCaseError(`Invalid component: ${component}!`);
  }
};
