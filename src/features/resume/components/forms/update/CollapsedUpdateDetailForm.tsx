import { useRouter } from "next/navigation";
import { useTransition, useMemo, useState } from "react";

import { toast } from "react-toastify";

import { type ApiDetail, type ApiNestedDetail, isNestedDetail } from "~/database/model";
import { logger } from "~/internal/logger";

import { deleteDetail } from "~/actions-v2/details/delete-detail";
import { deleteNestedDetail } from "~/actions-v2/details/delete-nested-detail";

import { IconButton } from "~/components/buttons";
import { DetailVisibilityButton } from "~/components/buttons/DetailVisibilityButton";

import {
  GenericUpdateDetailForm,
  type GenericUpdateDetailFormProps,
} from "./GenericUpdateDetailForm";

export interface CollapsedUpdateDetailFormProps<
  D extends ApiDetail<["skills"]> | ApiNestedDetail<["skills"]>,
> extends GenericUpdateDetailFormProps<D> {
  readonly onDeleted: () => void;
  readonly onExpand: () => void;
}

export const CollapsedUpdateDetailForm = <
  D extends ApiDetail<["skills"]> | ApiNestedDetail<["skills"]>,
>({
  onDeleted,
  onExpand,
  ...props
}: CollapsedUpdateDetailFormProps<D>): JSX.Element => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [_, transition] = useTransition();
  const { refresh } = useRouter();

  const deleteDetailWithId = useMemo(
    () =>
      isNestedDetail(props.detail)
        ? deleteNestedDetail.bind(null, props.detail.id)
        : deleteDetail.bind(null, props.detail.id),
    [props.detail],
  );

  return (
    <GenericUpdateDetailForm
      {...props}
      actions={[
        ...(props.actions ?? []),
        <IconButton.Transparent
          className="text-gray-600 hover:text-gray-700"
          key="0"
          icon={{ name: "up-right-and-down-left-from-center" }}
          size="xsmall"
          onClick={() => onExpand()}
        />,
        <DetailVisibilityButton<D> key="1" detail={props.detail} />,
        <IconButton.Transparent
          className="text-red-600 hover:text-red-700"
          key="2"
          icon={{ name: "trash-alt" }}
          size="xsmall"
          isLoading={isDeleting}
          onClick={async () => {
            setIsDeleting(true);
            let response: Awaited<ReturnType<typeof deleteDetailWithId>> | null = null;
            try {
              response = await deleteDetailWithId();
            } catch (e) {
              logger.errorUnsafe(
                e,
                `There was an error deleting the detail with ID '${props.detail.id}'.`,
                { detail: props.detail },
              );
              setIsDeleting(false);
              // TODO: Consider using a global form error here instead.
              return toast.error("There was an error updating the detail.");
            }
            const { error } = response;
            if (error) {
              logger.error(
                error,
                `There was an error deleting the detail with ID '${props.detail.id}'.`,
                { detail: props.detail },
              );
              setIsDeleting(false);
              return toast.error("There was an error deleting the detail.");
            }
            transition(() => {
              refresh();
              setIsDeleting(false);
              onDeleted();
            });
          }}
        />,
      ]}
      isScrollable={false}
      footerClassName="mt-0"
    />
  );
};

export default CollapsedUpdateDetailForm;
