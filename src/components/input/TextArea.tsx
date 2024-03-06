import { forwardRef, useEffect, useRef } from "react";

import { type InputWrapperProps, InputWrapper } from "./generic";

const autoSizeTextArea = (textarea: HTMLTextAreaElement) => {
  /* Temporarily set the height to 0px so the 'scrollHeight' for the text area element is
     the height that the text area element would otherwise be if the text was not cut off. */
  textarea.style.height = "0px";
  const scrollHeight = textarea.scrollHeight;
  textarea.style.height = scrollHeight + "px";
};

type AutoSizeCondition = "mount" | "change";

const shouldAutoSizeOn = (
  on: AutoSizeCondition,
  prop?: boolean | AutoSizeCondition | ["mount", "change"] | ["change", "mount"],
) => {
  if (typeof prop === "boolean") {
    return prop;
  } else if (Array.isArray(prop)) {
    return prop.includes(on);
  } else {
    return prop === on;
  }
};

export interface TextAreaProps
  extends Omit<
    InputWrapperProps<"textarea">,
    "component" | "children" | "dynamicHeight" | "value"
  > {
  readonly autoSize?: boolean | AutoSizeCondition | ["mount", "change"] | ["change", "mount"];
  readonly autoSizeIfEmpty?: boolean;
  readonly value?: string;
  readonly resize?: boolean;
}

const valueIsEmpty = (value: Exclude<HTMLTextAreaElement["value"], undefined>) =>
  Array.isArray(value) ? value.length === 0 : value.trim() === "";

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ autoSize, resize, autoSizeIfEmpty = false, ...props }: TextAreaProps, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const firstRendered = useRef(false);

    useEffect(() => {
      if (internalRef.current && shouldAutoSizeOn("mount", autoSize)) {
        /* If the TextArea is being used in a controlled sense (i.e. the 'value' is not undefined)
           only perform the auto-size on mount if the 'value' is not an empty string or the
           'autoSizeIfEmpty' prop is explicitly false. */
        if (props.value !== undefined && (!valueIsEmpty(props.value) || autoSizeIfEmpty)) {
          autoSizeTextArea(internalRef.current);
        } else if (
          /* If the TextArea is being used in an uncontrolled sense (i.e. the 'value' is undefined)
             only perform the auto-size on mount if the current ref's value is not an empty string
             or the 'autoSizeIfEmpty' prop is explicitly false. */
          props.value === undefined &&
          (!valueIsEmpty(internalRef.current.value) || autoSizeIfEmpty)
        ) {
          autoSizeTextArea(internalRef.current);
        }
        firstRendered.current = true;
      }
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [internalRef]);

    /* This hook is relevant for the case that the TextArea element is being used in a controlled
       sense.  In this case, if the resize should be performed as the user types (based on the
       definition of the 'autoSize' prop), resize the TextArea element as the user types. */
    useEffect(() => {
      if (
        props.value !== undefined &&
        firstRendered.current &&
        internalRef.current &&
        shouldAutoSizeOn("change", autoSize) &&
        (!valueIsEmpty(props.value) || autoSizeIfEmpty)
      ) {
        autoSizeTextArea(internalRef.current);
      }
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [props.value]);

    return (
      <InputWrapper<"textarea">
        {...props}
        style={
          resize !== undefined
            ? resize === false
              ? { ...props.style, resize: "none" }
              : props.style
            : autoSize !== false && autoSize !== undefined
              ? { ...props.style, resize: "none" }
              : props.style
        }
        ref={(instance: HTMLTextAreaElement | null) => {
          if (instance) {
            if (typeof ref === "function") {
              ref(instance);
            } else if (ref) {
              ref.current = instance;
            }
            internalRef.current = instance;
          }
        }}
        dynamicHeight={true}
        component="textarea"
        onChange={e => {
          /* If the TextArea element is being used in an uncontrolled case, we have to fire the
             autosize function via the 'onChange' event handler.  This is only applicable if the
             'autoSize' prop includes "change". */
          if (
            internalRef.current &&
            shouldAutoSizeOn("change", autoSize) &&
            (!valueIsEmpty(e.target.value) || autoSizeIfEmpty)
          ) {
            autoSizeTextArea(internalRef.current);
          }
          props.onChange?.(e);
        }}
      />
    );
  },
);
