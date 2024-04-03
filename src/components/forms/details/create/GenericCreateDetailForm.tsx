import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

import { type ApiDetail, type NestedApiDetail, type Project } from "~/prisma/model";
import { type ApiClientErrorJson, isApiClientErrorJson } from "~/api";
import { Link } from "~/components/buttons";

import { useForm } from "../../generic/hooks/use-form";
import { DetailForm, type DetailFormProps } from "../DetailForm";
import { type DetailFormValues, DetailFormSchema } from "../types";

export interface GenericCreateDetailFormProps<
  D extends ApiDetail<[], Project> | NestedApiDetail<[], Project>,
> extends Omit<
    DetailFormProps,
    "form" | "onSubmit" | "action" | "isNew" | "isOpen" | "onToggleOpen" | "actions"
  > {
  readonly onCreated: (detail: D) => void;
  readonly onCancel: () => void;
  readonly action: (
    data: DetailFormValues & { readonly visible: boolean },
  ) => Promise<D | ApiClientErrorJson>;
}

export const GenericCreateDetailForm = <
  D extends ApiDetail<[], Project> | NestedApiDetail<[], Project>,
>({
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
    />
  );
};
