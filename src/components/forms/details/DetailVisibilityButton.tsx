import { useRouter } from "next/navigation";
import { useTransition, useState, useCallback, useEffect } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { type Detail } from "~/prisma/model";
import { updateDetail } from "~/actions/update-detail";
import { IconButton } from "~/components/buttons";

export interface DetailVisibilityButtonProps {
  readonly detail: Detail;
}

export const DetailVisibilityButton = ({ detail }: DetailVisibilityButtonProps) => {
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

  const [isLoading, setIsLoading] = useState(false);
  const [isPending, transition] = useTransition();
  const { refresh } = useRouter();

  const onVisibilityChange = useCallback(async () => {
    setIsLoading(true);
    let success = false;
    try {
      await updateDetail(detail.id, { visible: !detail.visible });
      success = true;
    } catch (e) {
      logger.error("There was an error changing the detail's visibility.", {
        error: e,
        id: detail.id,
      });
      toast.error("There was an error changing the detail's visibility.");
    } finally {
      setIsLoading(false);
    }
    if (success) {
      setOptimisticIsVisible(!detail.visible);
      transition(() => refresh());
    }
  }, [refresh, detail.id, detail.visible]);

  useEffect(() => {
    setOptimisticIsVisible(detail.visible);
  }, [detail.visible]);

  return (
    <IconButton.Bare
      className="text-gray-600 hover:text-gray-700"
      icon={[
        { icon: { name: "eye-slash", iconStyle: "solid" }, visible: optimisticIsVisible },
        { icon: { name: "eye", iconStyle: "solid" }, visible: !optimisticIsVisible },
      ]}
      size="xsmall"
      isLoading={isLoading || isPending}
      onClick={() => onVisibilityChange()}
    />
  );
};
