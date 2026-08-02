import { useEffect, useRef } from 'react';

import { InputWrapper, type InputWrapperProps } from './generic';

/**
 * Resizes the provided text area element such that its height fits its content.
 *
 * The height is temporarily set to '0px' so that the 'scrollHeight' for the text area element is
 * the height that the text area element would otherwise be if the text was not cut off.
 */
const autoSizeTextArea = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = '0px';
  const scrollHeight = textarea.scrollHeight;
  textarea.style.height = scrollHeight + 'px';
};

type AutoSizeCondition = 'change' | 'mount';

const shouldAutoSizeOn = (
  on: AutoSizeCondition,
  prop?: ['change', 'mount'] | ['mount', 'change'] | AutoSizeCondition | boolean,
) => {
  if (typeof prop === 'boolean') {
    return prop;
  } else if (Array.isArray(prop)) {
    return prop.includes(on);
  }
  return prop === on;
};

export interface TextAreaProps extends Omit<
  InputWrapperProps<'textarea'>,
  'children' | 'component' | 'hasDynamicHeight' | 'value'
> {
  readonly autoSize?: ['change', 'mount'] | ['mount', 'change'] | AutoSizeCondition | boolean;
  readonly canResize?: boolean;
  readonly shouldAutoSizeIfEmpty?: boolean;
  readonly value?: string;
}

const valueIsEmpty = (value: Exclude<HTMLTextAreaElement['value'], undefined>) =>
  Array.isArray(value) ? value.length === 0 : value.trim() === '';

export const TextArea = ({
  autoSize,
  canResize,
  ref,
  shouldAutoSizeIfEmpty = true,
  ...props
}: TextAreaProps) => {
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const firstRendered = useRef(false);

  useEffect(() => {
    if (
      props.value !== undefined &&
      firstRendered.current &&
      internalRef.current &&
      shouldAutoSizeOn('change', autoSize) &&
      (!valueIsEmpty(props.value) || shouldAutoSizeIfEmpty)
    ) {
      autoSizeTextArea(internalRef.current);
    }
  }, [props.value, autoSize, shouldAutoSizeIfEmpty]);

  return (
    <InputWrapper<'textarea'>
      {...props}
      component='textarea'
      hasDynamicHeight
      onChange={e => {
        if (
          internalRef.current &&
          shouldAutoSizeOn('change', autoSize) &&
          props.value === undefined &&
          (!valueIsEmpty(e.target.value) || shouldAutoSizeIfEmpty)
        ) {
          autoSizeTextArea(internalRef.current);
        }
        props.onChange?.(e);
      }}
      ref={(instance: HTMLTextAreaElement | null) => {
        if (instance) {
          if (typeof ref === 'function') {
            ref(instance);
          } else if (ref) {
            ref.current = instance;
          }
          internalRef.current = instance;
          /* The initial auto-size is performed here, rather than in an effect, because this is the
             point at which the element is attached and can be measured.  It also means the sizing
             is reapplied if the element is ever remounted. */
          if (shouldAutoSizeOn('mount', autoSize)) {
            const value = props.value ?? instance.value;
            if (!valueIsEmpty(value) || shouldAutoSizeIfEmpty) {
              autoSizeTextArea(instance);
            }
            firstRendered.current = true;
          }
        }
      }}
      style={
        canResize === undefined
          ? autoSize !== false && autoSize !== undefined
            ? { ...props.style, resize: 'none' }
            : props.style
          : canResize === false
            ? { ...props.style, resize: 'none' }
            : props.style
      }
    />
  );
};
