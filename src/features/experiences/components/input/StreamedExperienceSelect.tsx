import { type ForwardedRef, type JSX, use, useEffect, useRef } from 'react';

import { type SelectBehaviorType } from '~/components/input/select';

import {
  ExperienceSelect,
  type ExperienceSelectInstance,
  type ExperienceSelectModel,
  type ExperienceSelectProps,
} from './ExperienceSelect';

export interface StreamedExperienceSelectProps<B extends SelectBehaviorType> extends Omit<
  ExperienceSelectProps<B>,
  'data'
> {
  /**
   * The experience options, started on the server without being awaited and resolved here with
   * `use()`. The promise never rejects: a failed server read resolves to `null`, which disables
   * the select and reports once through `onError`.
   */
  readonly dataPromise: Promise<ExperienceSelectModel[] | null>;
  readonly onError?: () => void;
}

/**
 * An {@link ExperienceSelect} fed by a server-started promise rather than a client-side fetch.
 *
 * `use()` suspends until the promise resolves, so this component must be rendered inside a
 * `Suspense` boundary whose fallback presents the select in its awaiting-data state
 * (`data={[]}`, `isReady={false}`, `isInputLoading`). Because the resolved select first mounts
 * with its data already in hand, the model value initializes synchronously in `useDataSelect`'s
 * `useState` initializer rather than through the async `isReady` flip.
 */
export const StreamedExperienceSelect = <B extends SelectBehaviorType>({
  dataPromise,
  onError,
  ref,
  ...props
}: {
  readonly ref?: ForwardedRef<ExperienceSelectInstance<B>>;
} & StreamedExperienceSelectProps<B>): JSX.Element => {
  const data = use(dataPromise);

  /* The ref confines the report to a single invocation: 'onError' is typically a form callback
     rebuilt on every render, and re-running it from this effect on every identity change could
     loop through the form's own re-render. */
  const hasReportedError = useRef(false);
  useEffect(() => {
    if (data === null && !hasReportedError.current) {
      hasReportedError.current = true;
      onError?.();
    }
  }, [data, onError]);

  return (
    <ExperienceSelect<B>
      {...props}
      data={data ?? []}
      isDisabled={data === null || props.isDisabled}
      ref={ref}
    />
  );
};
