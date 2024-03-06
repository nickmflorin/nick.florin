import { useEffect } from "react";

import clsx from "clsx";

import { isApiClientErrorResponse } from "~/application/errors";
import { type Detail } from "~/prisma/model";
import { DetailSchema } from "~/actions/schemas";
import { updateDetail } from "~/actions/update-detail";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../useForm";

import { DetailForm, type DetailFormProps } from "./DetailForm";
import { DetailVisibilityButton } from "./DetailVisibilityButton";
import { type DetailFormValues } from "./types";

export interface UpdateDetailFormProps
  extends Omit<DetailFormProps, "form" | "onSubmit" | "footer"> {
  readonly detail: Detail;
  readonly onSuccess?: (detail: Detail) => void;
}

export const UpdateDetailForm = ({
  detail,
  onSuccess,
  ...props
}: UpdateDetailFormProps): JSX.Element => {
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
      actions={[<DetailVisibilityButton key="0" detail={detail} />]}
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
