import clsx from "clsx";
import { useFormStatus } from "react-dom";

import { logger } from "~/application/logger";
import { type ButtonSize } from "~/components/buttons";
import { Button } from "~/components/buttons/generic/Button";
import { type ComponentProps } from "~/components/types";
import { ShowHide } from "~/components/util";

type ButtonFooterOrientation = "right" | "full-width" | "left";

export type ButtonFooterProps = ComponentProps & {
  readonly orientation?: ButtonFooterOrientation;
  readonly submitText?: string;
  readonly cancelText?: string;
  readonly submitButtonType?: "submit" | "button";
  readonly isSubmitting?: boolean;
  readonly isDisabled?: boolean;
  readonly submitIsDisabled?: boolean;
  readonly cancelIsDisabled?: boolean;
  readonly buttonSize?: ButtonSize;
  readonly onSubmit?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  readonly onCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const buttonVisibility = (
  props: Pick<ButtonFooterProps, "submitButtonType" | "onSubmit" | "onCancel">,
): { submit: boolean; cancel: boolean } => {
  if (props.onSubmit && props.submitButtonType === "submit") {
    throw new Error(
      "The 'onSubmit' handler should not be provided when the 'submitButtonType' is 'submit'.",
    );
  }
  return {
    /* The submit button should be shown if the submit handler is provided or if the submit button
       type is "submit". */
    submit: props.onSubmit !== undefined || props.submitButtonType === "submit",
    cancel: props.onCancel !== undefined,
  };
};

export const ButtonFooter = ({
  cancelText = "Cancel",
  submitText = "Save",
  submitButtonType = "submit",
  orientation = "right",
  buttonSize = "small",
  style,
  className,
  ...props
}: ButtonFooterProps) => {
  /* This hook will indicate a pending status when the component is inside of a Form and the Form's
     action is submitting.  As such, in cases where we are using the form's action prop and this
     component is inside of that form, we do not need to explicitly provide the 'submitting' prop to
     this component. */
  const { pending } = useFormStatus();

  const visibility = buttonVisibility({ submitButtonType, ...props });
  if (!(visibility.submit || visibility.cancel)) {
    logger.error("The button footer is not configured to show a submit or cancel button.");
    return <></>;
  }

  const submitting = [props.isSubmitting, pending].includes(true);

  return (
    <div
      style={style}
      className={clsx("button-footer", `button-footer--${orientation}`, className)}
    >
      <ShowHide show={visibility.cancel}>
        <Button.Secondary
          options={{ as: "button" }}
          className="button-footer__button"
          size={buttonSize}
          onClick={e => props.onCancel?.(e)}
          isLocked={submitting}
          isDisabled={props.isDisabled || props.cancelIsDisabled}
        >
          {cancelText}
        </Button.Secondary>
      </ShowHide>
      <ShowHide show={visibility.submit}>
        <Button.Primary
          className="button-footer__button"
          size={buttonSize}
          type={submitButtonType}
          isLoading={submitting}
          onClick={e => props.onSubmit?.(e)}
          isDisabled={props.isDisabled || props.submitIsDisabled}
        >
          {submitText}
        </Button.Primary>
      </ShowHide>
    </div>
  );
};
