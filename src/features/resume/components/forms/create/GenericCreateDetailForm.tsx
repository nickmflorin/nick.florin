import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiDetail, type ApiNestedDetail } from "~/database/model";
import { logger } from "~/internal/logger";

import { type MutationActionResponse } from "~/actions-v2";

import { Link } from "~/components/buttons";
import { FormFieldErrors } from "~/components/forms-v2/Field/FieldErrors";
import { Form, type FormProps } from "~/components/forms-v2/Form";
import { useForm } from "~/components/forms-v2/hooks/use-form";
import { TextInput } from "~/components/input/TextInput";

import { type DetailFormValues, DetailFormSchema } from "../types";

export interface GenericCreateDetailFormProps<
  D extends ApiDetail<["skills"]> | ApiNestedDetail<["skills"]>,
> extends Omit<
    FormProps<Pick<DetailFormValues, "label">>,
    "children" | "contentClassName" | "action" | "form"
  > {
  readonly onCreated: (detail: D) => void;
  readonly onCancel: () => void;
  readonly action: (
    data: Pick<DetailFormValues, "label"> & { readonly visible: boolean },
  ) => Promise<MutationActionResponse<D>>;
}

export const GenericCreateDetailForm = <
  D extends ApiDetail<["skills"]> | ApiNestedDetail<["skills"]>,
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
      action={async (data, form) => {
        setIsCreating(true);
        let response: MutationActionResponse<D> | null = null;
        try {
          response = await action({ ...data, visible: true });
        } catch (e) {
          logger.errorUnsafe(e, "There was an error creating the detail'.", {
            data,
          });
          // TODO: Consider using a global form error here instead.
          setIsCreating(false);
          return toast.error("There was an error creating the detail.");
        }
        const { error, data: detail } = response;
        if (error) {
          setIsCreating(false);
          return form.handleApiError(error);
        }
        form.reset();
        transition(() => {
          refresh();
          setIsCreating(false);
          onCreated(detail);
        });
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
                element="button"
                fontWeight="regular"
                fontSize="xs"
                onClick={() => {
                  form.reset();
                  onCancel();
                }}
              >
                Cancel
              </Link.Secondary>
              <Link.Primary
                element="button"
                fontWeight="regular"
                type="submit"
                fontSize="xs"
                loadingLocation="over"
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
