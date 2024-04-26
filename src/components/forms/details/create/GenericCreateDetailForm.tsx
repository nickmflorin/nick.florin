import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";

import { type ApiDetail, type NestedApiDetail } from "~/prisma/model";
import { type ApiClientErrorJson, isApiClientErrorJson } from "~/api";
import { Link } from "~/components/buttons";
import { FormFieldErrors } from "~/components/forms/generic/Field/FieldErrors";
import { Form, type FormProps } from "~/components/forms/generic/Form";
import { useForm } from "~/components/forms/generic/hooks/use-form";
import { TextInput } from "~/components/input/TextInput";

import { type DetailFormValues, DetailFormSchema } from "../types";

export interface GenericCreateDetailFormProps<
  D extends ApiDetail<["skills"]> | NestedApiDetail<["skills"]>,
> extends Omit<
    FormProps<Pick<DetailFormValues, "label">>,
    "children" | "contentClassName" | "action" | "form"
  > {
  readonly onCreated: (detail: D) => void;
  readonly onCancel: () => void;
  readonly action: (
    data: Pick<DetailFormValues, "label"> & { readonly visible: boolean },
  ) => Promise<D | ApiClientErrorJson>;
}

export const GenericCreateDetailForm = <
  D extends ApiDetail<["skills"]> | NestedApiDetail<["skills"]>,
>({
  onCreated,
  onCancel,
  action,
  ...props
}: GenericCreateDetailFormProps<D>): JSX.Element => {
  const [_, transition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);

  const { refresh } = useRouter();
  const form = useForm<Pick<DetailFormValues, "label">>({
    schema: DetailFormSchema.pick({ label: true }),
    defaultValues: {
      label: "",
    },
  });

  return (
    <Form
      {...props}
      form={form}
      action={async data => {
        setIsCreating(true);
        /* By default, assume newly created details are visible.  If visibility needs to be turned
           off, it can be done after the detail is created. */
        const response = await action({ ...data, visible: true });
        setIsCreating(false);
        if (isApiClientErrorJson(response)) {
          form.handleApiError(response);
        } else {
          form.reset();
          onCreated(response);
          transition(() => {
            refresh();
          });
        }
      }}
      contentClassName="gap-[12px]"
      structure={({ footer }) => (
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <Form.Field name="label" form={form} className="mr-[12px]" autoRenderErrors={false}>
              <TextInput
                className="w-full p-0 outline-none"
                {...form.register("label")}
                placeholder="Label"
                fontWeight="medium"
                size="small"
              />
            </Form.Field>
            <div className="flex flex-row gap-[6px] items-center">
              <Link.Secondary
                options={{ as: "button" }}
                fontWeight="regular"
                fontSize="xs"
                flex
                onClick={() => {
                  form.reset();
                  onCancel();
                }}
              >
                Cancel
              </Link.Secondary>
              <Link.Primary
                options={{ as: "button" }}
                fontWeight="regular"
                type="submit"
                fontSize="xs"
                loadingLocation="over"
                flex
                isLoading={isCreating}
              >
                Create
              </Link.Primary>
            </div>
          </div>
          <FormFieldErrors form={form} name="label" />
          <div className="flex flex-col mt-[4px]">{footer}</div>
        </div>
      )}
    />
  );
};
