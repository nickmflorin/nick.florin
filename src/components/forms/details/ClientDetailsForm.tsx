"use client";
import { useRouter } from "next/navigation";
import { useTransition, useMemo } from "react";

import { isApiClientErrorResponse } from "~/application/errors";
import { type DetailEntityType, type Detail } from "~/prisma/model";
import { DetailsSchema, isExistingDetail } from "~/actions/schemas";
import { updateDetails } from "~/actions/update-details";
import { IconButton } from "~/components/buttons";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { Collapse } from "~/components/structural/Collapse";
import { useDeepEqualEffect } from "~/hooks";

import { Form, type FormProps } from "../Form";
import { useForm } from "../useForm";

import { DetailFormFields } from "./DetailFormFields";
import { type DetailsFormValues } from "./types";

export interface DetailsFormProps
  extends Omit<
    FormProps<DetailsFormValues>,
    "children" | "onSubmit" | "contentClassName" | "form" | "footer" | "action"
  > {
  readonly details: Detail[];
  readonly entityId: string;
  readonly entityType: DetailEntityType;
  readonly title: string;
  readonly onCancel?: () => void;
}

export const DetailsForm = ({
  details,
  title,
  entityId,
  entityType,
  onCancel,
  ...props
}: DetailsFormProps): JSX.Element => {
  const [_, transition] = useTransition();
  const { refresh } = useRouter();

  const updateDetailsForEntity = useMemo(
    () => updateDetails.bind(null, entityId, entityType),
    [entityId, entityType],
  );

  const { setValues, ...form } = useForm<DetailsFormValues>({
    schema: DetailsSchema,
    defaultValues: {
      details: [],
    },
  });

  /* This is required to prevent the form from being reset to its original values after an error
     is returned from the action. */
  useDeepEqualEffect(() => {
    setValues({
      details: details.map(detail => ({
        ...detail,
        description: detail.description ?? "",
        shortDescription: detail.shortDescription ?? "",
      })),
    });
  }, [details, setValues]);

  return (
    <Form
      {...props}
      title={title}
      form={{ ...form, setValues }}
      footer={<ButtonFooter submitText="Save" onCancel={onCancel} />}
      contentClassName="gap-[12px]"
      action={async (data, form) => {
        const response = await updateDetailsForEntity(data);
        if (isApiClientErrorResponse(response)) {
          form.handleApiError(response);
        } else {
          transition(() => {
            refresh();
          });
        }
      }}
    >
      {form.watch("details").map((detail, i) => (
        <Collapse
          key={isExistingDetail(detail) ? detail.id : `new-detail-${i}`}
          className="border border-gray-200 rounded-md py-2 px-4"
          title={detail.label}
          actions={[
            <IconButton.Bare
              className="text-red-600 hover:text-red-700"
              key="0"
              icon={{ name: "trash-alt" }}
            />,
          ]}
        >
          <DetailFormFields form={{ ...form, setValues }} index={i} />
        </Collapse>
      ))}
    </Form>
  );
};

export default DetailsForm;
