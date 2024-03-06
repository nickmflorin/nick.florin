import { useMemo } from "react";

import { isApiClientErrorResponse } from "~/application/errors";
import { type DetailEntityType, type Detail } from "~/prisma/model";
import { createDetail } from "~/actions/create-detail";
import { DetailSchema } from "~/actions/schemas";
import { IconButton } from "~/components/buttons";
import { Collapse } from "~/components/structural/Collapse";

import { useForm } from "../useForm";

import { DetailForm, type DetailFormProps } from "./DetailForm";
import { type DetailFormValues } from "./types";

export interface CreateDetailFormProps extends Omit<DetailFormProps, "form" | "onSubmit"> {
  readonly entityId: string;
  readonly entityType: DetailEntityType;
  readonly onSuccess?: (detail: Detail) => void;
}

export const CreateDetailForm = ({
  entityId,
  entityType,
  onSuccess,
  ...props
}: CreateDetailFormProps): JSX.Element => {
  const createDetailForEntity = useMemo(
    () => createDetail.bind(null, entityId, entityType),
    [entityId, entityType],
  );

  const { setValues, ...form } = useForm<DetailFormValues>({
    schema: DetailSchema,
    defaultValues: {
      label: "",
      description: "",
      shortDescription: "",
    },
  });

  return (
    <Collapse
      className="border border-gray-200 rounded-md py-2 px-4"
      actions={[
        <IconButton.Bare
          className="text-red-600 hover:text-red-700"
          key="0"
          icon={{ name: "trash-alt" }}
        />,
      ]}
    >
      <DetailForm
        {...props}
        form={{ setValues, ...form }}
        action={async data => {
          /* By default, assume newly created details are visible.  If visibility needs to be turned
             off, it can be done after the detail is created. */
          const response = await createDetailForEntity({ ...data, visible: true });
          if (isApiClientErrorResponse(response)) {
            form.handleApiError(response);
          } else {
            onSuccess?.(response);
          }
        }}
      />
    </Collapse>
  );
};
