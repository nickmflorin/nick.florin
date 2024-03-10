"use client";
import React, {
  useId,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import clsx from "clsx";
import omit from "lodash.omit";
import pick from "lodash.pick";

import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";
import { mergeActions } from "~/components/structural";
import { type ComponentProps } from "~/components/types";
import { useReferentialCallback } from "~/hooks";

import { SaveAction, CancelAction } from "./actions";
import { type InputProps, Input, NativeInput, type NativeInputProps } from "./generic";

export const ReadWriteTextInputStates = enumeratedLiterals(["reading", "writing"] as const, {});
export type ReadWriteTextInputState = EnumeratedLiteralsType<typeof ReadWriteTextInputStates>;

export type ReadWriteTextInputInstance = {
  readonly clear: () => void;
  readonly setValue: (v: string, opts?: { state?: ReadWriteTextInputState }) => void;
  readonly cancel: () => void;
  readonly setState: (s: ReadWriteTextInputState) => void;
  readonly setLoading: (v: boolean) => void;
};

export interface ReadWriteTextInputProps
  extends Omit<InputProps, "children">,
    Omit<NativeInputProps, keyof InputProps> {
  readonly value?: string;
  readonly initialValue?: string;
  readonly initialState?: ReadWriteTextInputState;
  readonly state?: ReadWriteTextInputState;
  readonly withCancelButton?: boolean;
  readonly withPersistButton?: boolean;
  readonly persistOnEnter?: boolean;
  readonly cancelOnEscape?: boolean;
  readonly readingClassName?: ComponentProps["className"];
  readonly writingClassName?: ComponentProps["className"];
  readonly onPersist?: (
    text: string,
    instance: ReadWriteTextInputInstance,
  ) => void | boolean | undefined | Promise<boolean | void | undefined>;
  readonly onCancel?: (text: string) => void;
}

export const useReadWriteTextInput = () => {
  const ref = useRef<ReadWriteTextInputInstance>({
    setValue: () => {},
    clear: () => {},
    cancel: () => {},
    setState: () => {},
    setLoading: () => {},
  });
  return ref;
};

const isEnterEvent = (e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && !e.shiftKey;

const isEscapeEvent = (e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Escape";

const INPUT_PROPS = ["className", "style", "variant", "size"] as const;

export const ReadWriteTextInput = forwardRef<ReadWriteTextInputInstance, ReadWriteTextInputProps>(
  function _ReadWriteTextInput(
    {
      initialState = ReadWriteTextInputStates.READING,
      isDisabled = false,
      initialValue,
      isLoading: _propIsLoading = false,
      state: _propState,
      persistOnEnter = true,
      cancelOnEscape = true,
      readingClassName = "outline-transparent",
      writingClassName = "",
      withCancelButton = true,
      withPersistButton = true,
      actions: _actions,
      onPersist,
      onCancel,
      ...props
    },
    ref,
  ): JSX.Element {
    const [_state, _setState] = useState<ReadWriteTextInputState>(initialState);
    const state = _propState === undefined ? _state : _propState;

    const [_loading, setLoading] = useState(false);
    const isLoading = _propIsLoading || _loading;

    /* Keep track of the Cancel/Save button IDs so that the component can detect if blur events on
       the TextInput element come from the button clicks. */
    const cancelId = useId();
    const saveId = useId();

    const internalRef = useRef<HTMLInputElement | null>(null);
    const lastPersisted = useRef<string | null>(initialValue || null);

    const [changeExists, _setChangeExists] = useState(false);

    const setChangeExists = useCallback(() => {
      if (internalRef.current) {
        /* This is the initial unpersisted state, when not initialized with an initial value, before
           any persist has occurred. */
        if (lastPersisted.current === null) {
          if (internalRef.current.value !== "") {
            _setChangeExists(true);
          } else {
            _setChangeExists(false);
          }
        } else if (internalRef.current.value !== lastPersisted.current) {
          _setChangeExists(true);
        } else {
          _setChangeExists(false);
        }
      }
    }, []);

    useEffect(() => {
      if (initialValue !== undefined && internalRef.current) {
        internalRef.current.value = initialValue;
      }
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, []);

    const setState = useCallback((s: ReadWriteTextInputState) => {
      if (s === ReadWriteTextInputStates.READING && internalRef.current) {
        internalRef.current.blur();
      } else if (s === ReadWriteTextInputStates.WRITING && internalRef.current) {
        internalRef.current.focus();
      }
      _setState(s);
    }, []);

    const cancel = useCallback(() => {
      if (internalRef.current) {
        // Blurring will cause the state to be set to "reading" via 'onBlur'.
        internalRef.current.blur();

        if (lastPersisted.current) {
          internalRef.current.value = lastPersisted.current;
        } else {
          internalRef.current.value = initialValue || "";
        }
        setChangeExists();
        onCancel?.(internalRef.current.value);
      }
    }, [initialValue, setChangeExists, onCancel]);

    const setValue = useCallback(
      (v: string, options?: { state?: ReadWriteTextInputState }) => {
        if (internalRef.current) {
          internalRef.current.value = v;
          if (options?.state !== undefined) {
            setState(options.state);
          }
          setChangeExists();
        }
      },
      [setState, setChangeExists],
    );

    const refObj = useMemo(
      () => ({
        setLoading,
        setValue,
        setState,
        cancel,
        clear: () => {
          if (internalRef.current) {
            internalRef.current.value = "";
            setChangeExists();
          }
        },
      }),
      [setState, setValue, cancel, setChangeExists],
    );

    const persist = useReferentialCallback(async () => {
      const _persist = (instance: HTMLInputElement) => {
        // Blurring will cause the state to be set to "reading" via 'onBlur'.
        instance.blur();
        lastPersisted.current = instance.value;
        setChangeExists();
      };
      if (internalRef.current && internalRef.current.value !== lastPersisted.current) {
        if (typeof onPersist === "function") {
          const result = await onPersist(internalRef.current.value, refObj);
          if (result !== false && internalRef.current) {
            _persist(internalRef.current);
          }
        } else {
          _persist(internalRef.current);
        }
      } else if (internalRef.current) {
        internalRef.current.blur();
      }
    });

    useImperativeHandle(ref, () => refObj);

    const actions = useMemo(() => {
      if (withCancelButton || withPersistButton) {
        return mergeActions(_actions, {
          right: [
            withPersistButton ? (
              <SaveAction
                key="save"
                id={saveId}
                onClick={() => persist()}
                isDisabled={!changeExists}
                isVisible={state === ReadWriteTextInputStates.WRITING}
              />
            ) : null,
            withCancelButton ? (
              <CancelAction
                id={cancelId}
                key="cancel"
                onClick={() => cancel()}
                isDisabled={!changeExists}
                isVisible={state === ReadWriteTextInputStates.WRITING}
              />
            ) : null,
          ],
        });
      }
      return _actions;
    }, [
      _actions,
      withCancelButton,
      withPersistButton,
      changeExists,
      state,
      cancelId,
      saveId,
      persist,
      cancel,
    ]);

    return (
      <Input
        {...pick(props, INPUT_PROPS)}
        isLoading={isLoading}
        actions={actions}
        className={clsx(
          "text-input",
          {
            [clsx(writingClassName)]: state === ReadWriteTextInputStates.WRITING,
            [clsx(readingClassName)]: state === ReadWriteTextInputStates.READING,
          },
          props.className,
        )}
        isDisabled={isDisabled}
        onFocus={e => {
          e.preventDefault();
          setState(ReadWriteTextInputStates.WRITING);
          props.onFocus?.(e);
        }}
        onBlur={e => {
          /* If the reason the text input is blurring is due to a click of the Cancel or Save
             button, changing the state of the text area via _setState will cause the text area to
             rerender in a blurred state before the button's onClick handler fires - which will
             prevent the 'internalRef' from being accessed properly outside of the TextInput
             element. */
          if (
            !e.relatedTarget ||
            (e.relatedTarget.id !== cancelId && e.relatedTarget.id !== saveId)
          ) {
            setState(ReadWriteTextInputStates.READING);
          }
          props.onBlur?.(e);
        }}
      >
        <NativeInput
          {...omit(props, INPUT_PROPS)}
          isDisabled={isDisabled}
          ref={internalRef}
          onChange={e => {
            setChangeExists();
            props.onChange?.(e);
          }}
          onKeyDown={e => {
            if (internalRef.current) {
              if (
                state === ReadWriteTextInputStates.WRITING &&
                (isEnterEvent(e) || isEscapeEvent(e))
              ) {
                e.preventDefault();
                if (isEnterEvent(e) && persistOnEnter) {
                  persist();
                } else if (cancelOnEscape) {
                  cancel();
                }
              }
            }
            props.onKeyDown?.(e);
          }}
        />
      </Input>
    );
  },
);
