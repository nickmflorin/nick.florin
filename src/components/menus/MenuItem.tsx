'use client';
import dynamic from 'next/dynamic';
import {
  type JSX,
  type MouseEvent,
  type ComponentProps as ReactComponentProps,
  type ReactNode,
  type Ref,
  type TouchEvent,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { type Required } from 'utility-types';

import { type IconName, type IconProp, isIconProp, type SpinnerProps } from '~/components/icons';
import { Icon } from '~/components/icons/Icon';
import { Spinner } from '~/components/icons/Spinner';
import { Checkbox } from '~/components/input/Checkbox';
import { LoadingText } from '~/components/loading/LoadingText';
import * as types from '~/components/menus';
import { type Action } from '~/components/structural/Actions';
import { classNames, type ComponentProps, parseDataAttributes } from '~/components/types';
import {
  inferQuantitativeSizeValue,
  type QuantitativeSize,
  sizeToString,
} from '~/components/types/sizes';
import { Description } from '~/components/typography';
import { ReplacedSubstrings } from '~/components/typography/ReplacedSubstrings';
import { Square } from '~/components/util';

const Actions = dynamic(() => import('~/components/structural/Actions').then(mod => mod.Actions));

type MenuItemSimpleRenderCallback<V> =
  ((params: Omit<types.MenuItemRenderProps, `set${string}`>) => V) | V;

type MenuItemRenderCallback<V> = ((params: types.MenuItemRenderProps) => V) | V;

interface MenuItemCheckboxProps extends Omit<SpinnerProps, 'size'> {
  readonly checkboxSize: QuantitativeSize<'px'>;
  readonly isDisabled?: boolean;
  readonly isLocked?: boolean;
  readonly isSelected?: boolean;
  readonly spinnerSize: QuantitativeSize<'px'>;
}

/**
 * Stops propagation of a mouse-down or touch-start event originating from a MenuItem.
 *
 * When a drawer renders a Select whose popover is rendered in a portal, mouse-down and touch-start
 * events on the menu items inside that portal cause the drawer to close, because the
 * `useClickOutside` hook from `@mantine/hooks` applied to the drawer treats them as occurring
 * outside of it. Stopping propagation of these events prevents the drawer from closing.
 *
 * @param {MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>} e
 *   The mouse-down or touch-start event that occurred on the item.
 */
const stopMenuItemPointerPropagation = (
  e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
) => e.stopPropagation();

const MenuItemCheckbox = ({
  checkboxSize = '16px',
  isDisabled,
  isLoading,
  isLocked,
  isSelected,
  spinnerSize = '16px',
  ...props
}: MenuItemCheckboxProps) => (
  <Square
    areChildrenContained
    size={sizeToString(
      Math.max(inferQuantitativeSizeValue(checkboxSize), inferQuantitativeSizeValue(spinnerSize)),
      'px',
    )}
  >
    {isLoading ? (
      <Spinner {...props} isLoading size={spinnerSize} />
    ) : (
      <Checkbox
        isChecked={isSelected}
        isDisabled={isDisabled}
        isLocked={isLocked}
        readOnly
        size={checkboxSize}
      />
    )}
  </Square>
);

interface MenuItemLeftAffixProps {
  readonly checkboxSize?: QuantitativeSize<'px'>;
  readonly icon?: MenuItemSimpleRenderCallback<IconName | IconProp | JSX.Element | undefined>;
  readonly iconClassName?: ComponentProps['className'];
  readonly iconSize?: QuantitativeSize<'px'>;
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly isLocked?: boolean;
  readonly isSelected?: boolean;
  readonly selectionIndicator?: types.MenuItemSelectionIndicator;
  readonly spinnerClassName?: ComponentProps['className'];
  readonly spinnerSize?: QuantitativeSize<'px'>;
}

type DefaultedBooleanMap<M extends Partial<Record<string, boolean>>, V extends boolean> = {
  [key in keyof Required<M>]: [M[key]] extends [boolean] ? M[key] : V;
};

const defaultBooleanMap = <V extends boolean, M extends Partial<Record<string, boolean>>>(
  map: M,
  value: V,
): DefaultedBooleanMap<M, V> => {
  let newMap = {} as DefaultedBooleanMap<M, V>;
  for (const _k of Object.keys(map)) {
    const k = _k as keyof M;
    if (map[k] === undefined) {
      newMap = { ...newMap, [k]: value };
    }
  }
  return newMap;
};

const MenuItemLeftAffix = ({
  checkboxSize = '16px',
  icon: _icon,
  iconClassName,
  iconSize = '18px',
  selectionIndicator,
  spinnerClassName,
  spinnerSize = '16px',
  ...stateFlags
}: MenuItemLeftAffixProps) => {
  const icon = typeof _icon === 'function' ? _icon(defaultBooleanMap(stateFlags, false)) : _icon;
  if (
    !types.menuItemHasSelectionIndicator(selectionIndicator, 'checkbox') ||
    stateFlags.isSelected === undefined
  ) {
    if (icon !== undefined) {
      if (typeof icon === 'string' || isIconProp(icon)) {
        return (
          <Icon
            className={classNames('text-gray-600', iconClassName)}
            icon={icon}
            isLoading={stateFlags.isLoading}
            size={iconSize}
            spinnerClassName={spinnerClassName}
            spinnerSize={spinnerSize}
          />
        );
      }
      return (
        /* Set the size of the containing square to be the size that the Spinner will render as.
           Then, the 'areChildrenContained' flag will cause the children of the Square to not exceed
           the full height and/or width of the containing Square.  This is important to prevent
           text shifting from occurring when the MenuItem enters/exits the loading state, because
           the size of the JSX.Element provided via the 'icon' prop is both unknown and not capable
           of being directly manipulated (at least not easily). */
        <Square areChildrenContained size={spinnerSize}>
          {stateFlags.isLoading ? (
            <Spinner
              className={classNames('text-gray-600', iconClassName, spinnerClassName)}
              isLoading
              size={spinnerSize}
            />
          ) : (
            icon
          )}
        </Square>
      );
    } else if (stateFlags.isLoading) {
      /* If no 'icon' is provided, and the MenuItem is not rendering a Checkbox, the only option
         left for placing a loading indicator is placing it to the left of the rest of the
         MenuItemContent.  This will cause the MenuItem's content to shift left/right when the
         MenuItem enters and exits a loading state - but it is the only other option. */
      return (
        <Spinner
          className={classNames('text-gray-600', iconClassName, spinnerClassName)}
          isLoading
          size={spinnerSize}
        />
      );
    }
    return null;
  } else if (icon !== undefined) {
    if (typeof icon === 'string' || isIconProp(icon)) {
      return (
        <>
          <MenuItemCheckbox
            {...stateFlags}
            checkboxSize={checkboxSize}
            className={classNames('text-gray-600', iconClassName, spinnerClassName)}
            spinnerSize={spinnerSize}
          />
          {/* The loading indicator should appear over the checkbox, not the icon - so do not
              include the 'isLoading' flag. */}
          <Icon
            className={classNames('text-gray-600', iconClassName)}
            icon={icon}
            size={iconSize}
          />
        </>
      );
    }
    return (
      <>
        <MenuItemCheckbox
          {...stateFlags}
          checkboxSize={checkboxSize}
          className={classNames('text-gray-600', iconClassName, spinnerClassName)}
          spinnerSize={spinnerSize}
        />
        {icon}
      </>
    );
  }
  return (
    <MenuItemCheckbox
      {...stateFlags}
      checkboxSize={checkboxSize}
      className={classNames('text-gray-600', iconClassName, spinnerClassName)}
      spinnerSize={spinnerSize}
    />
  );
};

interface MenuItemContentProps extends MenuItemLeftAffixProps {
  readonly actions?: Action[];
  readonly boldSubstrings?: string;
  readonly children: MenuItemSimpleRenderCallback<ReactNode>;
  readonly contentClassName?: ComponentProps['className'];
  readonly description?: MenuItemSimpleRenderCallback<ReactNode>;
  readonly isDescriptionVisible?: boolean;
  readonly loadingText?: string;
}

const MenuItemContent = ({
  boldSubstrings,
  children: _children,
  contentClassName,
  description: _description,
  isDescriptionVisible = true,
  loadingText,
  ...rest
}: MenuItemContentProps) => {
  const description = useMemo(
    () =>
      typeof _description === 'function'
        ? _description({
            isDisabled: rest.isDisabled ?? false,
            isLoading: rest.isLoading ?? false,
            isLocked: rest.isLocked ?? false,
          })
        : _description,
    [_description, rest.isLocked, rest.isLoading, rest.isDisabled],
  );

  const children = useMemo(() => {
    let c: ReactNode;
    if (typeof _children === 'function') {
      c = _children({
        isDisabled: rest.isDisabled ?? false,
        isLoading: rest.isLoading ?? false,
        isLocked: rest.isLocked ?? false,
      });
    } else {
      c = _children;
    }
    if (typeof c === 'string' && boldSubstrings) {
      return (
        <ReplacedSubstrings fontWeight='semibold' substring={boldSubstrings}>
          {c}
        </ReplacedSubstrings>
      );
    }
    return c;
  }, [_children, boldSubstrings, rest.isLocked, rest.isLoading, rest.isDisabled]);

  if (description && isDescriptionVisible) {
    return (
      <div className='menu__item__content-wrapper'>
        <MenuItemContent
          {...rest}
          boldSubstrings={boldSubstrings}
          contentClassName={contentClassName}
          loadingText={loadingText}
        >
          {_children}
        </MenuItemContent>
        <Description className='menu__item__description' component='div'>
          {description}
        </Description>
      </div>
    );
  }

  return (
    <div className={classNames('menu__item__content', contentClassName)}>
      <MenuItemLeftAffix {...rest} />
      {children !== null && children !== undefined ? (
        <div className='menu__item__inner-content'>
          {rest.isLoading && loadingText ? <LoadingText>{loadingText}</LoadingText> : children}
        </div>
      ) : null}
      <Actions actions={rest.actions ?? []} />
    </div>
  );
};

export interface MenuItemProps
  extends
    ComponentProps,
    Omit<ReactComponentProps<'div'>, 'children' | 'onClick' | 'ref' | keyof ComponentProps>,
    Omit<MenuItemContentProps, 'children' | 'description'> {
  readonly children: ((params: types.MenuItemRenderProps) => ReactNode) | ReactNode;
  readonly description?: MenuItemRenderCallback<ReactNode>;
  readonly disabledClassName?: ComponentProps['className'];
  readonly height?: QuantitativeSize<'px'>;
  readonly isCurrentNavigation?: boolean;
  readonly loadingClassName?: ComponentProps['className'];
  readonly lockedClassName?: ComponentProps['className'];
  readonly navigatedClassName?: ComponentProps['className'];
  readonly onClick?: (
    e: MouseEvent<HTMLDivElement>,
    instance: types.ConnectedMenuItemInstance,
  ) => void;
  readonly ref?: Ref<types.ConnectedMenuItemInstance>;
  readonly selectedClassName?: ComponentProps['className'];
  readonly shouldHighlightOnHover?: boolean;
}

export const MenuItem = ({
  actions = [],
  boldSubstrings,
  checkboxSize,
  children,
  contentClassName,
  description,
  disabledClassName,
  height,
  icon,
  iconClassName,
  iconSize,
  isCurrentNavigation = false,
  isDescriptionVisible,
  isDisabled: propIsDisabled,
  isLoading: propIsLoading,
  isLocked: propIsLocked,
  isSelected = false,
  loadingClassName,
  loadingText,
  lockedClassName,
  navigatedClassName,
  ref,
  selectedClassName,
  selectionIndicator,
  shouldHighlightOnHover = true,
  spinnerClassName,
  spinnerSize,
  ...props
}: MenuItemProps): JSX.Element => {
  const localRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [locked, setLocked] = useState(false);

  const isLocked = (propIsLocked ?? false) || locked;
  const isLoading = (propIsLoading ?? false) || loading;
  const isDisabled = (propIsDisabled ?? false) || disabled;

  useImperativeHandle(ref, () => ({
    isConnected: true as const,
    setDisabled,
    setLoading,
    setLocked,
  }));

  return (
    <div
      {...props}
      {...parseDataAttributes({
        highlightOnHover: shouldHighlightOnHover,
        isDisabled,
        isLoading,
        isLocked,
        isNavigated: isCurrentNavigation,
        isSelected:
          isSelected && types.menuItemHasSelectionIndicator(selectionIndicator, 'highlight'),
      })}
      className={classNames(
        'menu__item',
        { 'pointer-events-auto cursor-pointer': props.onClick !== undefined },
        {
          [classNames(disabledClassName)]: isDisabled,
          [classNames(loadingClassName)]: isLoading,
          [classNames(lockedClassName)]: isLocked,
          [classNames(navigatedClassName)]: isCurrentNavigation,
          [classNames(selectedClassName)]: isSelected,
        },
        props.className,
      )}
      onClick={e => {
        e.stopPropagation();
        if (!isDisabled && !isLocked && !isLoading) {
          props.onClick?.(e, {
            ...(localRef.current as HTMLDivElement),
            isConnected: true,
            setDisabled,
            setLoading,
            setLocked,
          });
        }
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          localRef.current?.click();
        }
      }}
      onMouseDown={stopMenuItemPointerPropagation}
      onTouchStart={stopMenuItemPointerPropagation}
      ref={localRef}
      role='menuitem'
      style={
        height === undefined
          ? props.style
          : {
              ...props.style,
              height: sizeToString(height, 'px'),
              lineHeight: `${inferQuantitativeSizeValue(height) - 2 * 6}px`,
            }
      }
      tabIndex={0}
    >
      <MenuItemContent
        actions={actions}
        boldSubstrings={boldSubstrings}
        checkboxSize={checkboxSize}
        contentClassName={contentClassName}
        description={
          typeof description === 'function'
            ? params => description({ ...params, setDisabled, setLoading, setLocked })
            : description
        }
        icon={icon}
        iconClassName={iconClassName}
        iconSize={iconSize}
        isDescriptionVisible={isDescriptionVisible}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isLocked={isLocked}
        isSelected={isSelected}
        loadingText={loadingText}
        selectionIndicator={selectionIndicator}
        spinnerClassName={spinnerClassName}
        spinnerSize={spinnerSize}
      >
        {typeof children === 'function'
          ? params => children({ ...params, setDisabled, setLoading, setLocked })
          : children}
      </MenuItemContent>
    </div>
  );
};
