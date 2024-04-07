import { useRouter } from "next/navigation";
import { useEffect, useTransition, useMemo } from "react";

import { type ApiDetail, type NestedApiDetail, isNestedDetail } from "~/prisma/model";
import { updateDetail, updateNestedDetail } from "~/actions/mutations/details";
import { isApiClientErrorJson } from "~/api";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

import { useForm } from "../../generic/hooks/use-form";
import { DetailForm, type DetailFormProps } from "../DetailForm";
import { type DetailFormValues, DetailFormSchema } from "../types";

export interface GenericUpdateDetailFormProps<D extends ApiDetail<[]> | NestedApiDetail<[]>>
  extends Omit<
    DetailFormProps,
    "form" | "onSubmit" | "footer" | "isNew" | "isOpen" | "onToggleOpen"
  > {
  readonly detail: D;
}

export const GenericUpdateDetailForm = <D extends ApiDetail<[]> | NestedApiDetail<[]>>({
  detail,
  ...props
}: GenericUpdateDetailFormProps<D>): JSX.Element => {
  const [_, transition] = useTransition();
  const { refresh } = useRouter();

  const updateDetailWithId = useMemo(
    () =>
      isNestedDetail(detail)
        ? updateNestedDetail.bind(null, detail.id)
        : updateDetail.bind(null, detail.id),
    [detail],
  );

  const { setValues, ...form } = useForm<DetailFormValues>({
    schema: DetailFormSchema,
    defaultValues: {
      label: "",
      description: "",
      shortDescription: "",
      project: null,
      visible: true,
    },
  });

  useEffect(() => {
    setValues({
      label: detail.label,
      description: detail.description ?? "",
      shortDescription: detail.shortDescription ?? "",
      project: detail.project?.id ?? null,
      visible: detail.visible,
    });
  }, [detail, setValues]);

  return (
    <DetailForm
      {...props}
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
