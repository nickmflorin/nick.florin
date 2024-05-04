import clsx from "clsx";
import { useFormStatus } from "react-dom";

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
  readonly buttonSize?: ButtonSize<"button">;
  readonly onSubmit?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  readonly onCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const buttonVisibility = ({
  onSubmit,
  onCancel,
  submitButtonType,
}: Pick<ButtonFooterProps, "submitButtonType" | "onSubmit" | "onCancel">): {
  submit: boolean;
  cancel: boolean;
} => {
  if (onSubmit && submitButtonType === "submit") {
    throw new Error(
      "The 'onSubmit' handler should not be provided when the 'submitButtonType' is 'submit'.",
    );
  }
  return {
    /* The submit button should be shown if the submit handler is provided or if the submit button
       type is "submit". */
    submit: onSubmit !== undefined || submitButtonType === "submit",
    cancel: onCancel !== undefined,
  };
};

export const ButtonFooter = ({
  cancelText = "Cancel",
  submitText = "Save",
  submitButtonType = "submit",
  orientation = "right",
  buttonSize = "small",
  isSubmitting = false,
  isDisabled = false,
  submitIsDisabled = false,
  cancelIsDisabled = false,
  onSubmit,
  onCancel,
  ...props
}: ButtonFooterProps) => {
  /* This hook will indicate a pending status when the component is inside of a Form and the Form's
     action is submitting.  As such, in cases where we are using the form's action prop and this
     component is inside of that form, we do not need to explicitly provide the 'submitting' prop to
     this component. */
  const { pending } = useFormStatus();

  const visibility = buttonVisibility({ submitButtonType, onSubmit, onCancel, ...props });
  if (!(visibility.submit || visibility.cancel)) {
    import("~/application/logger").then(({ logger }) => {
      logger.error("The button footer is not configured to show a submit or cancel button.");
    });
    return <></>;
  }

  const submitting = [isSubmitting, pending].includes(true);

  return (
    <div
      {...props}
      className={clsx(
        "flex flex-row w-full items-center gap-2",
        {
          "justify-end": orientation === "right",
          "justify-start": orientation === "left",
          "[&>.button]:flex-1": orientation === "full-width",
        },
        props.className,
      )}
    >
      <ShowHide show={visibility.cancel}>
        <Button.Secondary
          as="button"
          className="button-footer__button"
          size={buttonSize}
          onClick={e => onCancel?.(e)}
          isLocked={submitting}
          isDisabled={isDisabled || cancelIsDisabled}
        >
          {cancelText}
        </Button.Secondary>
      </ShowHide>
      <ShowHide show={visibility.submit}>
        <Button.Primary
          className="button-footer__button"
          size={buttonSize}
          as="button"
          type={submitButtonType}
          isLoading={submitting}
          onClick={e => onSubmit?.(e)}
          isDisabled={isDisabled || submitIsDisabled}
        >
          {submitText}
        </Button.Primary>
      </ShowHide>
    </div>
  );
};
