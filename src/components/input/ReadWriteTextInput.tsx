'use client';
import {
  type FocusEvent,
  type JSX,
  type KeyboardEvent,
  type Ref,
  useCallback,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';
import { omit, pick } from 'lodash-es';

import { classNames, type ComponentProps } from '~/components/types';
import { useReferentialCallback } from '~/hooks';

import { CancelAction, SaveAction } from './actions';
import { Input, type InputProps, NativeInput, type NativeInputProps } from './generic';

export const ReadWriteTextInputStates = enumeratedLiterals(['reading', 'writing'] as const, {});
export type ReadWriteTextInputState = EnumeratedLiteralsMember<typeof ReadWriteTextInputStates>;

export type ReadWriteTextInputInstance = {
  readonly cancel: () => void;
  readonly clear: () => void;
  readonly setLoading: (v: boolean) => void;
  readonly setState: (s: ReadWriteTextInputState) => void;
  readonly setValue: (v: string, opts?: { state?: ReadWriteTextInputState }) => void;
};

export interface ReadWriteTextInputProps
  extends Omit<InputProps, 'children' | 'ref'>, Omit<NativeInputProps, keyof InputProps> {
  readonly hasCancelButton?: boolean;
  readonly hasPersistButton?: boolean;
  readonly initialState?: ReadWriteTextInputState;
  readonly initialValue?: string;
  readonly onCancel?: (text: string) => void;
  readonly onPersist?: (
    text: string,
    instance: ReadWriteTextInputInstance,
  ) => boolean | Promise<boolean | undefined | void> | undefined | void;
  readonly readingClassName?: ComponentProps['className'];
  readonly ref?: Ref<ReadWriteTextInputInstance>;
  readonly shouldCancelOnEscape?: boolean;
  readonly shouldPersistOnEnter?: boolean;
  readonly state?: ReadWriteTextInputState;
  readonly value?: string;
  readonly writingClassName?: ComponentProps['className'];
}

/* eslint-disable-next-line @typescript-eslint/no-empty-function -- Every method of the instance
   the ref is initialized with has to be a no-op until the component mounts and replaces it. */
const noop = () => {};

export const useReadWriteTextInput = () => {
  const ref = useRef<ReadWriteTextInputInstance>({
    cancel: noop,
    clear: noop,
    setLoading: noop,
    setState: noop,
    setValue: noop,
  });
  return ref;
};

const isEnterEvent = (e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && !e.shiftKey;

const isEscapeEvent = (e: KeyboardEvent<HTMLInputElement>) => e.key === 'Escape';

const INPUT_PROPS = ['className', 'style', 'variant', 'size', 'placeholder'] as const;

/**
 * Provides the IDs of the Cancel/Save buttons so that the component can detect whether blur events
 * on the TextInput element come from clicks of those buttons.
 */
const useActionButtonIds = () => {
  const cancelId = useId();
  const saveId = useId();
  return { cancelId, saveId };
};

/**
 * Blurs the provided input element, which causes the component's state to be set to "reading" via
 * the input's 'onBlur' handler.
 *
 * @param {HTMLInputElement} input The input element that should be blurred.
 */
const blurToReadingState = (input: HTMLInputElement) => input.blur();

/**
 * Returns whether the reason the text input is blurring is a click of the Cancel or Save button.
 *
 * When it is, the component must not transition back to the "reading" state, because changing the
 * state via 'setInternalState' would cause the text area to rerender in a blurred state before the
 * button's 'onClick' handler fires - which would prevent the 'internalRef' from being accessed
 * properly outside of the TextInput element.
 *
 * @param {FocusEvent<HTMLElement>} e The blur event that occurred on the text input.
 * @param {string[]} buttonIds The IDs of the Cancel/Save buttons.
 *
 * @returns {boolean} Whether the blur event originated from a click of the Cancel or Save button.
 */
const blurOriginatedFromActionButton = (e: FocusEvent<HTMLElement>, buttonIds: string[]): boolean =>
  e.relatedTarget !== null && buttonIds.includes(e.relatedTarget.id);

export const ReadWriteTextInput = ({
  actions: _actions,
  hasCancelButton = true,
  hasPersistButton = true,
  initialState = ReadWriteTextInputStates.READING,
  initialValue,
  isDisabled = false,
  isLoading: _propIsLoading = false,
  onCancel,
  onPersist,
  readingClassName = 'outline-transparent',
  ref,
  shouldCancelOnEscape = true,
  shouldPersistOnEnter = true,
  state: _propState,
  writingClassName = '',
  ...props
}: ReadWriteTextInputProps): JSX.Element => {
  const [internalState, setInternalState] = useState<ReadWriteTextInputState>(initialState);
  const state = _propState ?? internalState;

  const [loading, setLoading] = useState(false);
  const isLoading = _propIsLoading || loading;

  const { cancelId, saveId } = useActionButtonIds();

  const internalRef = useRef<HTMLInputElement | null>(null);
  const lastPersisted = useRef<null | string>(initialValue || null);

  const [changeExists, setChangeExists] = useState(false);

  const syncChangeExists = useCallback(() => {
    if (internalRef.current) {
      /* This is the initial unpersisted state, when not initialized with an initial value, before
         any persist has occurred. */
      if (lastPersisted.current === null) {
        setChangeExists(internalRef.current.value !== '');
      } else {
        setChangeExists(internalRef.current.value !== lastPersisted.current);
      }
    }
  }, []);

  const setState = useCallback((s: ReadWriteTextInputState) => {
    if (s === ReadWriteTextInputStates.READING && internalRef.current) {
      internalRef.current.blur();
    } else if (s === ReadWriteTextInputStates.WRITING && internalRef.current) {
      internalRef.current.focus();
    }
    setInternalState(s);
  }, []);

  const cancel = useCallback(() => {
    if (internalRef.current) {
      blurToReadingState(internalRef.current);
      if (lastPersisted.current) {
        internalRef.current.value = lastPersisted.current;
      } else {
        internalRef.current.value = initialValue || '';
      }
      syncChangeExists();
      onCancel?.(internalRef.current.value);
    }
  }, [initialValue, syncChangeExists, onCancel]);

  const setValue = useCallback(
    (v: string, options?: { state?: ReadWriteTextInputState }) => {
      if (internalRef.current) {
        internalRef.current.value = v;
        if (options?.state !== undefined) {
          setState(options.state);
        }
        syncChangeExists();
      }
    },
    [setState, syncChangeExists],
  );

  const refObj = useMemo(
    () => ({
      cancel,
      clear: () => {
        if (internalRef.current) {
          internalRef.current.value = '';
          syncChangeExists();
        }
      },
      setLoading,
      setState,
      setValue,
    }),
    [setState, setValue, cancel, syncChangeExists],
  );

  const persist = useReferentialCallback(async () => {
    const _persist = (instance: HTMLInputElement) => {
      blurToReadingState(instance);
      lastPersisted.current = instance.value;
      syncChangeExists();
    };
    const input = internalRef.current;
    if (input && input.value !== lastPersisted.current) {
      if (typeof onPersist === 'function') {
        const result = await onPersist(input.value, refObj);
        /* The input element can be unmounted while the persist handler is in flight, in which
           case the ref will have been detached and there is nothing left to persist. */
        const persistedInput = internalRef.current;
        if (result !== false && persistedInput) {
          _persist(persistedInput);
        }
      } else {
        _persist(input);
      }
    } else if (input) {
      blurToReadingState(input);
    }
  });

  useImperativeHandle(ref, () => refObj);

  const actions = useMemo(() => {
    if (hasCancelButton || hasPersistButton) {
      return [
        ...(_actions ?? []),
        hasPersistButton ? (
          <SaveAction
            id={saveId}
            isDisabled={!changeExists}
            isVisible={state === ReadWriteTextInputStates.WRITING}
            key='save'
            onClick={() => persist()}
          />
        ) : null,
        hasCancelButton ? (
          <CancelAction
            id={cancelId}
            isDisabled={!changeExists}
            isVisible={state === ReadWriteTextInputStates.WRITING}
            key='cancel'
            onClick={() => cancel()}
          />
        ) : null,
      ];
    }
    return _actions;
  }, [
    _actions,
    hasCancelButton,
    hasPersistButton,
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
      actions={actions}
      className={classNames(
        'text-input',
        {
          [classNames(readingClassName)]: state === ReadWriteTextInputStates.READING,
          [classNames(writingClassName)]: state === ReadWriteTextInputStates.WRITING,
        },
        props.className,
      )}
      isDisabled={isDisabled}
      isLoading={isLoading}
      onBlur={e => {
        if (!blurOriginatedFromActionButton(e, [cancelId, saveId])) {
          setState(ReadWriteTextInputStates.READING);
        }
        props.onBlur?.(e);
      }}
      onFocus={e => {
        e.preventDefault();
        setState(ReadWriteTextInputStates.WRITING);
        props.onFocus?.(e);
      }}
    >
      <NativeInput
        {...omit(props, INPUT_PROPS)}
        defaultValue={initialValue}
        isDisabled={isDisabled}
        onChange={e => {
          syncChangeExists();
          props.onChange?.(e);
        }}
        onKeyDown={e => {
          if (internalRef.current) {
            if (
              state === ReadWriteTextInputStates.WRITING &&
              (isEnterEvent(e) || isEscapeEvent(e))
            ) {
              e.preventDefault();
              if (isEnterEvent(e) && shouldPersistOnEnter) {
                void persist();
              } else if (shouldCancelOnEscape) {
                cancel();
              }
            }
          }
          props.onKeyDown?.(e);
        }}
        ref={internalRef}
      />
    </Input>
  );
};
