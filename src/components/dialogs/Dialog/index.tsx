"use client";
import { forwardRef, type ReactNode } from "react";

import {
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
  FloatingOverlay,
} from "@floating-ui/react";

import { useDialogContext } from "~/components/dialogs/hooks/use-dialog-context";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

import { DialogClose } from "./DialogClose";
import { DialogContent } from "./DialogContent";
import { DialogDescription } from "./DialogDescription";
import { DialogFooter } from "./DialogFooter";
import { DialogProvider } from "./DialogProvider";
import { DialogTitle } from "./DialogTitle";

export interface DialogProps
  extends ComponentProps,
    Omit<React.HTMLProps<HTMLDivElement>, keyof ComponentProps | "title"> {
  readonly title?: JSX.Element | string;
  readonly footer?: ReactNode;
  readonly children: ReactNode;
}

const LocalDialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ title, footer, ...props }, _ref): JSX.Element => {
    const { context, refs, isOpen, titleId, contentId, floatingProps } = useDialogContext();
    const ref = useMergeRefs([refs.setFloating, _ref]);

    if (!isOpen) {
      return <></>;
    }

    return (
      <FloatingPortal>
        <FloatingOverlay className="dialog__overlay" lockScroll>
          <FloatingFocusManager context={context}>
            <div
              /* Note: Do not use the 'floatingStyles' attribute of the hook return, as it causes
                 the transform to be applied to the coordinate 0,0 (i.e. top left of screen) instead
                 of properly centering in the middle of the viewport based on the styling defined
                 in the SASS file for the "dialog__overlay" class. */
              {...props}
              className={classNames("dialog", props.className)}
              ref={ref}
              aria-labelledby={titleId}
              aria-describedby={contentId}
              {...floatingProps}
            >
              {title && <DialogTitle>{title}</DialogTitle>}
              {props.children}
              {footer && <DialogFooter>{footer}</DialogFooter>}
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      </FloatingPortal>
    );
  },
);

export const Dialog = Object.assign(LocalDialog, {
  Title: DialogTitle,
  Description: DialogDescription,
  Provider: DialogProvider,
  Footer: DialogFooter,
  Close: DialogClose,
  Content: DialogContent,
});
