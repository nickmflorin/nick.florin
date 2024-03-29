import { useRouter } from "next/navigation";
import { useEffect, useTransition, useMemo, useState } from "react";

import { toast } from "react-toastify";

import { type FullDetail, type NestedDetail, isFullDetail } from "~/prisma/model";
import { deleteDetail } from "~/actions/mutations/delete-detail";
import { deleteNestedDetail } from "~/actions/mutations/delete-nested-detail";
import { updateDetail } from "~/actions/mutations/update-detail";
import { updateNestedDetail } from "~/actions/mutations/update-nested-detail";
import { isApiClientErrorJson } from "~/api";
import { IconButton } from "~/components/buttons";
import { DetailVisibilityButton } from "~/components/buttons/DetailVisibilityButton";
import { type Action, mergeActions } from "~/components/structural";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../generic/hooks/use-form";

import { DetailForm, type DetailFormProps } from "./DetailForm";
import { type DetailFormValues, DetailFormSchema } from "./types";

export interface UpdateDetailFormProps<D extends FullDetail | NestedDetail>
  extends Omit<
    DetailFormProps,
    "form" | "onSubmit" | "footer" | "isNew" | "isOpen" | "onToggleOpen"
  > {
  readonly detail: D;
  readonly actions?: Action[];
  readonly onDeleted: () => void;
}

export const UpdateDetailForm = <D extends FullDetail | NestedDetail>({
  detail,
  actions,
  onDeleted,
  ...props
}: UpdateDetailFormProps<D>): JSX.Element => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [_, transition] = useTransition();
  const { refresh } = useRouter();

  const updateDetailWithId = useMemo(
    () =>
      isFullDetail(detail)
        ? updateDetail.bind(null, detail.id)
        : updateNestedDetail.bind(null, detail.id),
    [detail],
  );

  const deleteDetailWithId = useMemo(
    () =>
      isFullDetail(detail)
        ? deleteDetail.bind(null, detail.id)
        : deleteNestedDetail.bind(null, detail.id),
    [detail],
  );

  const { setValues, ...form } = useForm<DetailFormValues>({
    schema: DetailFormSchema,
    defaultValues: {
      label: "",
      description: "",
      shortDescription: "",
    },
  });

  useEffect(() => {
    setValues({
      label: detail.label,
      description: detail.description ?? "",
      shortDescription: detail.shortDescription ?? "",
    });
  }, [detail, setValues]);

  return (
    <DetailForm
      {...props}
      actions={mergeActions(actions, [
        <DetailVisibilityButton<D> key="0" detail={detail} />,
        <IconButton.Bare
          className="text-red-600 hover:text-red-700"
          key="1"
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
              logger.error("There was an error deleting the detail.", { error: e, id: detail.id });
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
      footer={<ButtonFooter submitText="Save" buttonSize="xsmall" />}
      form={{ setValues, ...form }}
      action={async data => {
        const response = await updateDetailWithId(data);
        if (isApiClientErrorJson(response)) {
          form.handleApiError(response);
        } else {
          /* Note: We may not need this transition, since this is just updating a
             detail and we only currently show the number of details in the table. */
          transition(() => {
            refresh();
          });
        }
      }}
    />
  );
};

export default UpdateDetailForm;
