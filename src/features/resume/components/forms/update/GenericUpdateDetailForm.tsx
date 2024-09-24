import { useRouter } from "next/navigation";
import React, { useState, useTransition, useMemo, useEffect } from "react";

import { type ApiDetail, type NestedApiDetail, isNestedDetail } from "~/database/model";

import { updateDetail, updateNestedDetail } from "~/actions/mutations/details";
import { isApiClientErrorJson } from "~/api";

import { IconButton } from "~/components/buttons";
import { FormFieldErrors } from "~/components/forms/Field/FieldErrors";
import { CheckboxField } from "~/components/forms/fields/CheckboxField";
import { Form, type FormProps } from "~/components/forms/Form";
import { useForm } from "~/components/forms/hooks";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";
import { type Action } from "~/components/structural/Actions";
import { Actions } from "~/components/structural/Actions";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { classNames } from "~/components/types";
import { ShowHide } from "~/components/util";
import { ClientProjectSelect } from "~/features/projects/components/input/ClientProjectSelect";
import { ClientSkillsSelect } from "~/features/skills/components/input/ClientSkillsSelect";

import { type DetailFormValues, DetailFormSchema } from "../types";

export interface GenericUpdateDetailFormProps<
  D extends ApiDetail<["skills"]> | NestedApiDetail<["skills"]>,
> extends Omit<FormProps<DetailFormValues>, "children" | "contentClassName" | "form" | "action"> {
  readonly actions?: Action[];
  readonly isExpanded: boolean;
  readonly detail: D;
}

export const GenericUpdateDetailForm = <
  D extends ApiDetail<["skills"]> | NestedApiDetail<["skills"]>,
>({
  actions,
  detail,
  isExpanded,
  ...props
}: GenericUpdateDetailFormProps<D>): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

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
      skills: [],
    },
  });

  useEffect(() => {
    setValues({
      label: detail.label,
      description: detail.description ?? "",
      shortDescription: detail.shortDescription ?? "",
      project: detail.project?.id ?? null,
      visible: detail.visible,
      skills: detail.skills.map(sk => sk.id),
    });
  }, [detail, setValues]);

  return (
    <Form<DetailFormValues>
      {...props}
      footer={<ButtonFooter submitText="Save" buttonSize="xsmall" />}
      form={{ setValues, ...form }}
      action={async data => {
        const response = await updateDetailWithId({
          ...data,
          skills: data.skills,
        });
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
      contentClassName="gap-[12px]"
      structure={
        !isExpanded
          ? ({ footer, body }) => (
              <div className="flex flex-col">
                <div className="flex flex-row justify-between items-center">
                  <Form.Field
                    name="label"
                    form={{ ...form, setValues }}
                    className="mr-[12px]"
                    autoRenderErrors={false}
                  >
                    <TextInput
                      className="w-full p-0 outline-none"
                      {...form.register("label")}
                      placeholder="Label"
                      isReadOnly={!isOpen}
                      fontWeight="medium"
                      size="small"
                    />
                  </Form.Field>
                  <div className="flex flex-row gap-[6px] items-center">
                    <Actions actions={actions ?? []} />
                    <IconButton.Transparent
                      key={actions ? actions.length : "0"}
                      size="xsmall"
                      onClick={() => setIsOpen(curr => !curr)}
                    >
                      <CaretIcon open={isOpen} />
                    </IconButton.Transparent>
                  </div>
                </div>
                <ShowHide show={isOpen === true}>
                  <FormFieldErrors form={{ ...form, setValues }} name="label" />
                  <div className="flex flex-col mt-[4px]">
                    {body}
                    {footer}
                  </div>
                </ShowHide>
              </div>
            )
          : ({ footer, body }) => (
              <>
                {body}
                {footer}
              </>
            )
      }
    >
      <ShowHide show={isExpanded}>
        <Form.Field
          name="label"
          form={{ ...form, setValues }}
          label="Label"
          autoRenderErrors={false}
          labelProps={{ fontSize: "xs" }}
        >
          <TextInput
            className={classNames("w-full", { "p-0 outline-none": !isExpanded })}
            {...form.register("label")}
            placeholder="Label"
            fontWeight={isExpanded ? "regular" : "medium"}
            size="small"
          />
        </Form.Field>
      </ShowHide>
      <Form.Field
        name="description"
        label="Description"
        form={{ ...form, setValues }}
        labelProps={{ fontSize: "xs" }}
      >
        <TextArea
          className={classNames("w-full", { "p-0 outline-none": !isExpanded })}
          autoSize={true}
          {...form.register("description")}
          size="small"
          placeholder={
            "A brief description of the detail that will appear on the " + "online portfolio."
          }
        />
      </Form.Field>
      <Form.Field
        name="shortDescription"
        label="Short Description"
        form={{ ...form, setValues }}
        labelProps={{ fontSize: "xs" }}
      >
        <TextArea
          className={classNames("w-full", { "p-0 outline-none": !isExpanded })}
          autoSize={true}
          {...form.register("shortDescription")}
          /* This simply sets the text area to a single row unless it has content in it that spans
           multiple rows. */
          rows={1}
          placeholder="A shortened version of the description."
          size="small"
        />
      </Form.Field>
      <Form.ControlledField
        name="skills"
        label="Skills"
        labelProps={{ fontSize: "xs" }}
        form={{ ...form, setValues }}
        helpText="Any skills that the detail is associated with, if applicable."
      >
        {({ value, onChange }) => (
          <ClientSkillsSelect
            behavior="multi"
            visibility="admin"
            inputClassName="w-full"
            value={value}
            onChange={onChange}
            inPortal
            onError={() => form.setErrors("skills", "There was an error loading the data.")}
          />
        )}
      </Form.ControlledField>
      <Form.ControlledField
        name="project"
        label="Project"
        labelProps={{ fontSize: "xs" }}
        form={{ ...form, setValues }}
        helpText="The project that the detail is associated with, if applicable."
      >
        {({ value, onChange }) => (
          <ClientProjectSelect
            inputClassName="w-full"
            value={value}
            behavior="single-nullable"
            isClearable
            onChange={onChange}
            inPortal
            onError={() => form.setErrors("project", "There was an error loading the data.")}
          />
        )}
      </Form.ControlledField>
      <ShowHide show={isExpanded}>
        <CheckboxField name="visible" form={{ ...form, setValues }} label="Visible" />
      </ShowHide>
    </Form>
  );
};
