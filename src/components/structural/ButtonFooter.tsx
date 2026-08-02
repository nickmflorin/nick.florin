import { type MouseEvent } from 'react';

import { useFormStatus } from 'react-dom';

import { type ButtonSize } from '~/components/buttons';
import { Button } from '~/components/buttons/generic/Button';
import { classNames, type ComponentProps } from '~/components/types';
import { ShowHide } from '~/components/util';

type ButtonFooterOrientation = 'full-width' | 'left' | 'right';

export type ButtonFooterProps = {
  readonly buttonSize?: ButtonSize;
  readonly cancelText?: string;
  readonly isCancelDisabled?: boolean;
  readonly isDisabled?: boolean;
  readonly isSubmitDisabled?: boolean;
  readonly isSubmitting?: boolean;
  readonly onCancel?: (e: MouseEvent<HTMLButtonElement>) => void;
  readonly onSubmit?: (e: MouseEvent<HTMLButtonElement>) => void;
  readonly orientation?: ButtonFooterOrientation;
  readonly submitButtonType?: 'button' | 'submit';
  readonly submitText?: string;
} & ComponentProps;

/**
 * Whether the submit button should be shown, which is the case if the submit handler is provided
 * or if the submit button type is "submit".
 */
const isSubmitButtonVisible = (
  onSubmit: ButtonFooterProps['onSubmit'],
  submitButtonType: ButtonFooterProps['submitButtonType'],
): boolean => onSubmit !== undefined || submitButtonType === 'submit';

const buttonVisibility = ({
  onCancel,
  onSubmit,
  submitButtonType,
}: Pick<ButtonFooterProps, 'onCancel' | 'onSubmit' | 'submitButtonType'>): {
  cancel: boolean;
  submit: boolean;
} => {
  if (onSubmit && submitButtonType === 'submit') {
    throw new Error(
      "The 'onSubmit' handler should not be provided when the 'submitButtonType' is 'submit'.",
    );
  }
  return {
    cancel: onCancel !== undefined,
    submit: isSubmitButtonVisible(onSubmit, submitButtonType),
  };
};

/**
 * Indicates a pending status when the calling component is inside of a `Form` and the form's
 * action is submitting.
 *
 * As such, in cases where the form's `action` prop is used and {@link ButtonFooter} is inside of
 * that form, the `isSubmitting` prop does not need to be explicitly provided to it.
 */
const usePendingFormStatus = () => useFormStatus();

export const ButtonFooter = ({
  buttonSize = 'small',
  cancelText = 'Cancel',
  isCancelDisabled = false,
  isDisabled = false,
  isSubmitDisabled = false,
  isSubmitting = false,
  onCancel,
  onSubmit,
  orientation = 'right',
  submitButtonType = 'submit',
  submitText = 'Save',
  ...props
}: ButtonFooterProps) => {
  const { pending } = usePendingFormStatus();

  const visibility = buttonVisibility({ onCancel, onSubmit, submitButtonType, ...props });
  if (!(visibility.submit || visibility.cancel)) {
    void import('~/internal/logger').then(({ logger }) => {
      logger.error('The button footer is not configured to show a submit or cancel button.');
    });
    return null;
  }

  const submitting = [isSubmitting, pending].includes(true);

  return (
    <div
      {...props}
      className={classNames(
        'flex flex-row w-full items-center gap-2',
        {
          '[&>.button]:flex-1': orientation === 'full-width',
          'justify-end': orientation === 'right',
          'justify-start': orientation === 'left',
        },
        props.className,
      )}
    >
      <ShowHide show={visibility.cancel}>
        <Button.Solid
          className='button-footer__button'
          element='button'
          isDisabled={isDisabled || isCancelDisabled}
          isLocked={submitting}
          onClick={e => onCancel?.(e)}
          scheme='secondary'
          size={buttonSize}
        >
          {cancelText}
        </Button.Solid>
      </ShowHide>
      <ShowHide show={visibility.submit}>
        <Button.Solid
          className='button-footer__button'
          element='button'
          isDisabled={isDisabled || isSubmitDisabled}
          isLoading={submitting}
          onClick={e => onSubmit?.(e)}
          size={buttonSize}
          type={submitButtonType}
        >
          {submitText}
        </Button.Solid>
      </ShowHide>
    </div>
  );
};
