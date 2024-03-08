import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type ApiClientErrorResponse, isApiClientErrorResponse } from "~/application/errors";
import { type FullDetail, type NestedDetail } from "~/prisma/model";

import { useForm } from "../../useForm";
import { DetailForm, type DetailFormProps } from "../DetailForm";
import { type WithoutNestedDetails, type DetailFormValues, DetailFormSchema } from "../types";

export interface GenericCreateDetailFormProps<D extends FullDetail | NestedDetail>
  extends Omit<
    DetailFormProps,
    "form" | "onSubmit" | "action" | "isNew" | "isOpen" | "onToggleOpen"
  > {
  readonly onCreate: () => void;
  readonly action: (
    data: DetailFormValues & { readonly visible: boolean },
  ) => Promise<WithoutNestedDetails<D> | ApiClientErrorResponse>;
  readonly onSuccess: (detail: WithoutNestedDetails<D>) => void;
  readonly onFailure: () => void;
}

export const GenericCreateDetailForm = <D extends FullDetail | NestedDetail>({
  action,
  onSuccess,
  onCreate,
  onFailure,
  ...props
}: GenericCreateDetailFormProps<D>): JSX.Element => {
  const [_, transition] = useTransition();
  const { refresh } = useRouter();
  const { setValues, ...form } = useForm<DetailFormValues>({
    schema: DetailFormSchema,
    defaultValues: {
      label: "",
      description: "",
      shortDescription: "",
    },
  });

  return (
    <DetailForm
      {...props}
      isNew={true}
      isScrollable={false}
      form={{ setValues, ...form }}
      action={async data => {
        onCreate();
        /* By default, assume newly created details are visible.  If visibility needs to be turned
           off, it can be done after the detail is created. */
        const response = await action({ ...data, visible: true });
        if (isApiClientErrorResponse(response)) {
          form.handleApiError(response);
          onFailure();
        } else {
          onSuccess(response);
          form.reset();
          transition(() => {
            refresh();
          });
        }
      }}
    />
  );
};
