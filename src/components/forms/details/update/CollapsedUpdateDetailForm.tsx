import { useRouter } from "next/navigation";
import { useTransition, useMemo, useState } from "react";

import { toast } from "react-toastify";

import { type ApiDetail, type NestedApiDetail, isNestedDetail } from "~/prisma/model";
import { deleteDetail, deleteNestedDetail } from "~/actions/mutations/details";
import { IconButton } from "~/components/buttons";
import { DetailVisibilityButton } from "~/components/buttons/DetailVisibilityButton";
import { mergeActions } from "~/components/structural";

import {
  GenericUpdateDetailForm,
  type GenericUpdateDetailFormProps,
} from "./GenericUpdateDetailForm";

export interface CollapsedUpdateDetailFormProps<D extends ApiDetail<[]> | NestedApiDetail<[]>>
  extends GenericUpdateDetailFormProps<D> {
  readonly onDeleted: () => void;
  readonly onExpand: () => void;
}

export const CollapsedUpdateDetailForm = <D extends ApiDetail<[]> | NestedApiDetail<[]>>({
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
      actions={mergeActions(props.actions, [
        <IconButton.Bare
          className="text-gray-600 hover:text-gray-700"
          key="0"
          icon={{ name: "up-right-and-down-left-from-center" }}
          size="xsmall"
          onClick={() => onExpand()}
        />,
        <DetailVisibilityButton<D> key="1" detail={props.detail} />,
        <IconButton.Bare
          className="text-red-600 hover:text-red-700"
          key="2"
          icon={{ name: "trash-alt" }}
          size="xsmall"
          isLoading={isDeleting}
          onClick={async () => {
            setIsDeleting(true);
            let success = false;
            try {
              await deleteDetailWithId();
              success = true;
            } catch (e) {
              const logger = (await import("~/application/logger")).logger;
              logger.error("There was an error deleting the detail.", {
                error: e,
                id: props.detail.id,
              });
              toast.error("There was an error deleting the detail.");
            } finally {
              setIsDeleting(false);
            }
            if (success) {
              onDeleted();
              transition(() => {
                refresh();
              });
            }
          }}
        />,
      ])}
      isScrollable={false}
      footerClassName="mt-0"
    />
  );
};

export default CollapsedUpdateDetailForm;