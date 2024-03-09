import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

import { type ApiClientErrorResponse, isApiClientErrorResponse } from "~/application/errors";
import { type FullDetail, type NestedDetail } from "~/prisma/model";
import { Link } from "~/components/buttons";

import { useForm } from "../../useForm";
import { DetailForm, type DetailFormProps } from "../DetailForm";
import { type WithoutNestedDetails, type DetailFormValues, DetailFormSchema } from "../types";

export interface GenericCreateDetailFormProps<D extends FullDetail | NestedDetail>
  extends Omit<
    DetailFormProps,
    "form" | "onSubmit" | "action" | "isNew" | "isOpen" | "onToggleOpen" | "actions"
  > {
  readonly onCreated: (detail: WithoutNestedDetails<D>) => void;
  readonly onCancel: () => void;
  readonly action: (
    data: DetailFormValues & { readonly visible: boolean },
  ) => Promise<WithoutNestedDetails<D> | ApiClientErrorResponse>;
}

export const GenericCreateDetailForm = <D extends FullDetail | NestedDetail>({
  action,
  onCreated,
  onCancel,
  ...props
}: GenericCreateDetailFormProps<D>): JSX.Element => {
  const [_, transition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);

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
      actions={[
        <Link.Secondary
          options={{ as: "button" }}
          fontWeight="regular"
          fontSize="xs"
          key="0"
          flex
          onClick={() => {
            form.reset();
            onCancel();
          }}
        >
          Cancel
        </Link.Secondary>,
        <Link.Primary
          options={{ as: "button" }}
          fontWeight="regular"
          type="submit"
          fontSize="xs"
          loadingLocation="over"
          key="1"
          flex
          isLoading={isCreating}
        >
          Create
        </Link.Primary>,
      ]}
      action={async data => {
        setIsCreating(true);
        /* By default, assume newly created details are visible.  If visibility needs to be turned
           off, it can be done after the detail is created. */
        const response = await action({ ...data, visible: true });
        setIsCreating(false);
        if (isApiClientErrorResponse(response)) {
          form.handleApiError(response);
        } else {
          form.reset();
          onCreated(response);
          transition(() => {
            refresh();
          });
        }
      }}
    />
  );
};
