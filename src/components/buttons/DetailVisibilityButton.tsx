import { useRouter } from "next/navigation";
import { useTransition, useState, useCallback, useEffect, useMemo } from "react";

import { toast } from "react-toastify";

import { type ApiDetail, type ApiNestedDetail, isNestedDetail } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateDetail } from "~/actions-v2/details/update-detail";
import { updateNestedDetail } from "~/actions-v2/details/update-nested-detail";

import { IconButton } from "~/components/buttons";
import { Icon } from "~/components/icons/Icon";
import { classNames } from "~/components/types";

export interface DetailVisibilityButtonProps<D extends ApiDetail<[]> | ApiNestedDetail<[]>> {
  readonly detail: D;
}

export const DetailVisibilityButton = <D extends ApiDetail<[]> | ApiNestedDetail<[]>>({
  detail,
}: DetailVisibilityButtonProps<D>) => {
  /* We keep track of the visibility of the detail in state, separately from the visible attribute
     on the detail, for purposes of optimistic updates after the API request to update the detail
     succeeds, but before the router is refreshed and a new batch of details are rendered in the
     original server component.  If we didn't do this, there is an unattractive lag between the
     time that the spinner finishes loading and the time that the button's icon actually changes.
     This lag is caused by the time that it takes for the server component to re-request the
     details and propogate them through to the client components.

     An effect is used to ensure that the actual visibility of the detail - which is still the
     source of truth - is in sync with the button icon.  This state variable is simply used to
     update the icon immediately. */
  const [optimisticIsVisible, setOptimisticIsVisible] = useState(detail.visible);

  const updateDetailWithId = useMemo(
    () =>
      isNestedDetail(detail)
        ? updateNestedDetail.bind(null, detail.id)
        : updateDetail.bind(null, detail.id),
    [detail],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isPending, transition] = useTransition();
  const { refresh } = useRouter();

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
      // TODO: Consider using a global form error here instead.
      return toast.error("There was an error updating the detail.");
    }
    const { error } = response;
    if (error) {
      logger.error(
        error,
        `There was an error toggling the visibility state for the detail with ID '${detail.id}'.`,
        { detail, visible: !detail.visible },
      );
      setIsLoading(false);
      // TODO: Consider using a global form error here instead.
      return toast.error("There was an error updating the detail.");
    }
    setOptimisticIsVisible(!detail.visible);
    transition(() => {
      refresh();
      setIsLoading(false);
    });
  }, [refresh, updateDetailWithId, detail]);

  useEffect(() => {
    setOptimisticIsVisible(detail.visible);
  }, [detail.visible]);

  return (
    <IconButton.Transparent
      className="text-gray-600 hover:text-gray-700"
      icon={
        <>
          <Icon
            icon="eye-slash"
            iconStyle="solid"
            className={classNames({ hidden: optimisticIsVisible })}
          />
          <Icon
            icon="eye"
            iconStyle="solid"
            className={classNames({ hidden: !optimisticIsVisible })}
          />
        </>
      }
      size="xsmall"
      isLoading={isLoading || isPending}
      onClick={() => onVisibilityChange()}
    />
  );
};
