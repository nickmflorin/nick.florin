import { useEffect } from "react";

import clsx from "clsx";
import { toast } from "react-toastify";

import { isApiClientErrorResponse } from "~/application/errors";
import { logger } from "~/application/logger";
import { type Detail, type FullDetail, type NestedDetail } from "~/prisma/model";
import { deleteDetail } from "~/actions/delete-detail";
import { DetailSchema } from "~/actions/schemas";
import { updateDetail } from "~/actions/update-detail";
import { IconButton } from "~/components/buttons";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../useForm";

import { DetailForm, type DetailFormProps } from "./DetailForm";
import { DetailVisibilityButton } from "./DetailVisibilityButton";
import { type WithoutNestedDetails, type DetailFormValues } from "./types";

export interface UpdateDetailFormProps<D extends FullDetail | NestedDetail>
  extends Omit<DetailFormProps, "form" | "onSubmit" | "footer"> {
  readonly detail: D;
  readonly onSuccess?: (detail: WithoutNestedDetails<D>) => void;
}

export const UpdateDetailForm = <D extends FullDetail | NestedDetail>({
  detail,
  onSuccess,
  ...props
}: UpdateDetailFormProps<D>): JSX.Element => {
  const updateDetailWithId = updateDetail.bind(null, detail.id);

  const { setValues, ...form } = useForm<DetailFormValues>({
    schema: DetailSchema,
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
      className={clsx("mb-1 pr-1", props.className)}
      actions={[
        <DetailVisibilityButton key="0" detail={detail} />,
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
          onSuccess?.(response);
        }
      }}
    />
  );
};
