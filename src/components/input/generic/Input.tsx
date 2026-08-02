import { type ComponentProps as ReactComponentProps, type ReactNode } from 'react';

import { IconButton } from '~/components/buttons';
import { type IconName, type IconProp } from '~/components/icons';
import { CaretIcon } from '~/components/icons/CaretIcon';
import { Icon } from '~/components/icons/Icon';
import { Spinner } from '~/components/icons/Spinner';
import { type InputEventName } from '~/components/input/types';
import { type Action, Actions } from '~/components/structural/Actions';
import { classNames, type ComponentProps } from '~/components/types';

import { InputWrapper, type InputWrapperProps } from './InputWrapper';

export interface InputProps
  extends
    Omit<InputWrapperProps<'div'>, 'component' | 'onChange' | 'placeholder'>,
    ComponentProps,
    Pick<ReactComponentProps<'div'>, InputEventName> {
  readonly actions?: Action[];
  readonly clearIcon?: IconName | IconProp;
  readonly hasCaret?: boolean;
  readonly icon?: IconName | IconProp;
  readonly id?: string;
  readonly isCaretOpen?: boolean;
  readonly isClearDisabled?: boolean;
  readonly isClearVisible?: boolean;
  readonly isPlaceholderVisible?: boolean;
  readonly onClear?: () => void;
  readonly placeholder?: ReactNode;
  readonly shouldReserveSpaceForLoadingIndicator?: boolean;
}

const InputPlaceholder = ({
  children,
  isPlaceholderVisible = false,
  placeholder,
}: {
  readonly children: ReactNode;
  readonly isPlaceholderVisible?: boolean;
  readonly placeholder?: ReactNode;
}) => {
  if (isPlaceholderVisible && placeholder) {
    return <div className='placeholder'>{placeholder}</div>;
  }
  return <>{children}</>;
};

export const Input = ({
  actions = [],
  children,
  clearIcon = { name: 'xmark' },
  hasCaret = false,
  icon,
  isCaretOpen = false,
  isClearDisabled = false,
  isClearVisible = true,
  isPlaceholderVisible,
  onClear,
  placeholder,
  ref,
  shouldReserveSpaceForLoadingIndicator = false,
  ...props
}: InputProps) => (
  <InputWrapper {...props} component='div' ref={ref}>
    {icon && <Icon icon={icon} />}
    <div className='input__content'>
      <InputPlaceholder isPlaceholderVisible={isPlaceholderVisible} placeholder={placeholder}>
        {children}
      </InputPlaceholder>
    </div>
    <Actions
      actions={[
        <div
          className={classNames('items-center justify-center', {
            'w-[14px]': shouldReserveSpaceForLoadingIndicator || props.isLoading === true,
          })}
          key='0'
        >
          <Spinner className='text-gray-500' isLoading={props.isLoading === true} size='14px' />
        </div>,
        ...actions,
        onClear && isClearVisible && !isPlaceholderVisible && (
          <IconButton.Transparent
            className='text-gray-400 aspect-square p-[2px] hover:text-gray-500'
            element='button'
            icon={clearIcon}
            iconSize='16px'
            isDisabled={isClearDisabled}
            key={actions.length + 1}
            onClick={e => {
              e.stopPropagation();
              onClear();
            }}
            radius='full'
            size='22px'
          />
        ),
        hasCaret && (
          <CaretIcon
            className='text-gray-700 aspect-square w-auto h-[22px] p-[4px]'
            isOpen={isCaretOpen}
            key={actions.length + 2}
            onClick={props.onClick}
            onMouseDown={props.onMouseDown}
            /* These props are passed to CaretIcon so that its outer <div /> also picks up click
               events in cases where the Input is being used for a Select or other component where
               click events on the Input are used. */
            onPointerDown={props.onPointerDown}
            onPointerUp={props.onMouseDown}
            size='14px'
          />
        ),
      ]}
      className='input__actions'
      gap={2}
    />
  </InputWrapper>
);
