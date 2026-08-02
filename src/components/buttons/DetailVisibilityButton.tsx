import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';

import { toast } from 'react-toastify';

import { type ApiDetail, type ApiNestedDetail, isNestedDetail } from '~/database/model';
import { logger } from '~/internal/logger';

import { updateDetail } from '~/actions/details/update-detail';
import { updateNestedDetail } from '~/actions/details/update-nested-detail';

import { IconButton } from '~/components/buttons';
import { Icon } from '~/components/icons/Icon';
import { classNames } from '~/components/types';

export interface DetailVisibilityButtonProps<D extends ApiDetail<[]> | ApiNestedDetail<[]>> {
  readonly detail: D;
}

/**
 * Tracks the visibility of a detail separately from its `visible` attribute, so that the icon
 * rendered by {@link DetailVisibilityButton} can update optimistically after a request to update
 * the detail succeeds, but before the router refresh completes and the server component re-renders
 * with a new batch of details.
 *
 * Without this, there is an unattractive lag between the time the spinner finishes loading and the
 * time the button's icon actually changes, caused by the time it takes for the server component to
 * re-request the details and propagate them through to the client components.
 *
 * The returned state is kept in sync with the detail's actual visibility - which remains the source
 * of truth - via an effect that runs whenever it changes.
 */
const useOptimisticVisibility = (visible: boolean) => {
  const [optimisticIsVisible, setOptimisticIsVisible] = useState(visible);

  useEffect(() => {
    setOptimisticIsVisible(visible);
  }, [visible]);

  return [optimisticIsVisible, setOptimisticIsVisible] as const;
};

export const DetailVisibilityButton = <D extends ApiDetail<[]> | ApiNestedDetail<[]>>({
  detail,
}: DetailVisibilityButtonProps<D>) => {
  const [optimisticIsVisible, setOptimisticIsVisible] = useOptimisticVisibility(detail.visible);

  const updateDetailWithId = useMemo(
    () =>
      isNestedDetail(detail)
        ? updateNestedDetail.bind(null, detail.id)
        : updateDetail.bind(null, detail.id),
    [detail],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isPending, transition] = useTransition();
  const router = useRouter();

  const onVisibilityChange = useCallback(async () => {
    setIsLoading(true);
    let response: Awaited<ReturnType<typeof updateDetailWithId>> | null = null;
    try {
      response = await updateDetailWithId({ visible: !detail.visible });
    } catch (e) {
      logger.errorUnsafe(
        e,
        `There was an error toggling the visibility state for the detail with ID '${detail.id}'.`,
        { detail, visible: !detail.visible },
      );
      setIsLoading(false);
      return toast.error('There was an error updating the detail.');
    }
    const { error } = response;
    if (error) {
      logger.error(
        error,
        `There was an error toggling the visibility state for the detail with ID '${detail.id}'.`,
        { detail, visible: !detail.visible },
      );
      setIsLoading(false);
      return toast.error('There was an error updating the detail.');
    }
    setOptimisticIsVisible(!detail.visible);
    transition(() => {
      router.refresh();
      setIsLoading(false);
    });
  }, [router, updateDetailWithId, detail, setOptimisticIsVisible]);

  return (
    <IconButton.Transparent
      className='text-gray-600 hover:text-gray-700'
      icon={
        <>
          <Icon
            className={classNames({ hidden: optimisticIsVisible })}
            icon='eye-slash'
            iconStyle='solid'
          />
          <Icon
            className={classNames({ hidden: !optimisticIsVisible })}
            icon='eye'
            iconStyle='solid'
          />
        </>
      }
      isLoading={isLoading || isPending}
      onClick={() => onVisibilityChange()}
      size='xsmall'
    />
  );
};
