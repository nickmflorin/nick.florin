'use client';
import { type HTMLProps, type JSX, type ReactNode, type Ref } from 'react';

import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useMergeRefs,
} from '@floating-ui/react';

import { useDialogContext } from '~/components/dialogs/hooks/use-dialog-context';
import { classNames, type ComponentProps } from '~/components/types';

import { DialogClose } from './DialogClose';
import { DialogContent } from './DialogContent';
import { DialogDescription } from './DialogDescription';
import { DialogFooter } from './DialogFooter';
import { DialogRoot } from './DialogRoot';
import { DialogTitle } from './DialogTitle';

export interface DialogProps
  extends ComponentProps, Omit<HTMLProps<HTMLDivElement>, 'title' | keyof ComponentProps> {
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly ref?: Ref<HTMLDivElement>;
  readonly title?: JSX.Element | string;
}

const LocalDialog = ({
  footer,
  ref: forwardedRef,
  title,
  ...props
}: DialogProps): JSX.Element | null => {
  const { contentId, context, floatingProps, isOpen, refs, titleId } = useDialogContext();
  const ref = useMergeRefs([refs.setFloating.bind(refs), forwardedRef]);

  if (!isOpen) {
    return null;
  }

  return (
    <FloatingPortal>
      <FloatingOverlay className='dialog__overlay' lockScroll>
        <FloatingFocusManager context={context}>
          <div
            /* The 'floatingStyles' attribute of the hook return is not used here, as it causes
               the transform to be applied to the coordinate 0,0 (i.e. top left of screen) instead
               of properly centering in the middle of the viewport based on the styling defined in
               the SASS file for the "dialog__overlay" class. */
            {...props}
            aria-describedby={contentId}
            aria-labelledby={titleId}
            className={classNames('dialog', props.className)}
            ref={ref}
            {...floatingProps}
          >
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {props.children}
            {footer ? <DialogFooter>{footer}</DialogFooter> : null}
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  );
};

export const Dialog = Object.assign(LocalDialog, {
  Close: DialogClose,
  Content: DialogContent,
  Description: DialogDescription,
  Footer: DialogFooter,
  Root: DialogRoot,
  Title: DialogTitle,
});
