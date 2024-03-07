"use client";
import { useRouter } from "next/navigation";
import { useEffect, useTransition, useMemo } from "react";

import { toast } from "react-toastify";

import { isApiClientErrorResponse } from "~/application/errors";
import { logger } from "~/application/logger";
import { type FullDetail, type NestedDetail, isFullDetail } from "~/prisma/model";
import { deleteDetail } from "~/actions/delete-detail";
import { updateDetail } from "~/actions/update-detail";
import { updateNestedDetail } from "~/actions/update-nested-detail";
import { IconButton } from "~/components/buttons";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../useForm";

import { DetailForm, type DetailFormProps } from "./DetailForm";
import { DetailVisibilityButton } from "./DetailVisibilityButton";
import { type DetailFormValues, DetailFormSchema } from "./types";

export interface UpdateDetailFormProps<D extends FullDetail | NestedDetail>
  extends Omit<DetailFormProps, "form" | "onSubmit" | "footer" | "isNew"> {
  readonly detail: D;
}

export const UpdateDetailForm = <D extends FullDetail | NestedDetail>({
  detail,
  ...props
}: UpdateDetailFormProps<D>): JSX.Element => {
  const [_, transition] = useTransition();
  const { refresh } = useRouter();

  const updateDetailWithId = useMemo(
    () =>
      isFullDetail(detail)
        ? updateDetail.bind(null, detail.id)
        : updateNestedDetail.bind(null, detail.id),
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
      actions={[
        <DetailVisibilityButton<D> key="0" detail={detail} />,
        <IconButton.Bare
          className="text-red-600 hover:text-red-700"
          key="1"
          icon={{ name: "trash-alt" }}
          size="xsmall"
          onClick={async () => {
            try {
              await deleteDetail(detail.id);
            } catch (e) {
              logger.error("There was an error deleting the detail.", { error: e, id: detail.id });
              toast.error("There was an error deleting the detail.");
            }
          }}
        />,
      ]}
      isScrollable={false}
      footerClassName="mt-0"
      footer={<ButtonFooter submitText="Save" buttonSize="xsmall" />}
      form={{ setValues, ...form }}
      action={async data => {
        const response = await updateDetailWithId(data);
        if (isApiClientErrorResponse(response)) {
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
