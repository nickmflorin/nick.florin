import { type JSX, type ReactNode, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { CaretIcon } from '~/components/icons/CaretIcon';
import { type Action, Actions } from '~/components/structural/Actions';
import { type ClassName, classNames, type ComponentProps } from '~/components/types';
import { Text, type TextProps } from '~/components/typography';

export interface CollapseProps extends ComponentProps {
  readonly actions?: ((params: { isOpen: boolean }) => Action[]) | Action[];
  readonly children: ReactNode;
  readonly closedClassName?: ClassName;
  readonly contentClassName?: ClassName;
  readonly headerClassName?: ClassName;
  readonly isEnabled?: boolean;
  readonly isInitiallyOpen?: boolean;
  readonly isOpen?: boolean;
  readonly onOpenChange?: (isOpen: boolean) => void;
  readonly openClassName?: ClassName;
  readonly title?: JSX.Element | string;
  readonly titleProps?: Omit<TextProps<'div'>, 'children' | 'ref'>;
}

export const Collapse = ({
  actions = [],
  children,
  closedClassName,
  contentClassName,
  headerClassName,
  isEnabled = true,
  isInitiallyOpen = true,
  isOpen: _isOpen,
  onOpenChange,
  openClassName,
  title,
  titleProps,
  ...props
}: CollapseProps): JSX.Element => {
  const [internalIsOpen, setInternalIsOpen] = useState(isInitiallyOpen && isEnabled);

  const isOpen = _isOpen ?? internalIsOpen;

  const toggle = () => {
    if (isEnabled) {
      setInternalIsOpen(curr => !curr);
      onOpenChange?.(!isOpen);
    }
  };

  return (
    <div
      {...props}
      className={classNames(
        'collapseable',
        openClassName && isOpen,
        closedClassName && !isOpen,
        props.className,
      )}
    >
      <div
        aria-expanded={isOpen}
        className={classNames('collapse__header', headerClassName)}
        onClick={toggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        role='button'
        tabIndex={0}
      >
        <div className='collapse__title'>
          {typeof title === 'string' ? <Text {...titleProps}>{title}</Text> : title}
        </div>
        <div className='collapse__affixes'>
          <Actions actions={typeof actions === 'function' ? actions({ isOpen }) : actions} />
          <CaretIcon className='h-[14px]' isOpen={isOpen} key={actions.length + 1} />
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            className={classNames('collapse__content', contentClassName)}
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
