import {
  type ChangeEvent,
  type ForwardedRef,
  type JSX,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { Input, type InputProps } from '~/components/input/generic';
import { NativeInput } from '~/components/input/generic/NativeInput';
import { type InputEventName } from '~/components/input/types';
import { classNames } from '~/components/types';

export interface RootSelectInputInstance extends HTMLDivElement {
  readonly focus: () => void;
  readonly setLoading: (v: boolean) => void;
}

export interface RootSelectInputProps extends Pick<
  InputProps,
  | 'actions'
  | 'children'
  | 'className'
  | 'hasCaret'
  | 'hasDynamicHeight'
  | 'id'
  | 'isActive'
  | 'isClearDisabled'
  | 'isDisabled'
  | 'isLoading'
  | 'isLocked'
  | 'isPlaceholderVisible'
  | 'onClear'
  | 'placeholder'
  | 'size'
  | InputEventName
> {
  readonly isOpen: boolean;
  readonly onSearch?: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly search?: string;
}

export const RootSelectInput = ({
  children,
  hasDynamicHeight = true,
  isLoading: propIsLoading,
  isOpen = false,
  onClear,
  onSearch,
  ref,
  search: propSearch,
  ...props
}: {
  readonly ref?: ForwardedRef<RootSelectInputInstance>;
} & RootSelectInputProps): JSX.Element => {
  const [internalIsLoading, setInternalIsLoading] = useState(false);

  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLInputElement>(null);
  const [internalSearch, setInternalSearch] = useState('');

  const search = propSearch ?? internalSearch;
  const isLoading = internalIsLoading || propIsLoading;

  useEffect(() => {
    if (isOpen && innerRef.current) {
      innerRef.current.focus();
    } else if (!isOpen && innerRef.current) {
      innerRef.current.blur();
    }
  }, [isOpen]);

  useImperativeHandle(ref, () =>
    Object.assign(outerRef.current as HTMLDivElement, {
      focus: () => innerRef.current?.focus(),
      setLoading: (v: boolean) => setInternalIsLoading(v),
    }),
  );

  return (
    <Input
      hasCaret
      {...props}
      className={classNames('select', props.className)}
      hasDynamicHeight={hasDynamicHeight}
      isActive={isOpen || props.isActive}
      isCaretOpen={isOpen}
      isClearVisible={onSearch === undefined ? true : !isOpen}
      isLoading={isLoading}
      isPlaceholderVisible={
        onSearch === undefined ? props.isPlaceholderVisible : !isOpen && props.isPlaceholderVisible
      }
      onClear={onClear && (() => onClear())}
      ref={outerRef}
    >
      {onSearch && isOpen ? (
        <NativeInput
          onChange={e => {
            setInternalSearch(e.target.value);
            onSearch(e);
          }}
          onClick={e => {
            e.stopPropagation();
          }}
          ref={innerRef}
          value={search}
        />
      ) : (
        children
      )}
    </Input>
  );
};
