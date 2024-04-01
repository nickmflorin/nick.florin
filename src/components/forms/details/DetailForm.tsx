import React, { useState } from "react";

import { IconButton } from "~/components/buttons";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { ClientProjectSelect } from "~/components/input/select/ClientProjectSelect";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";
import { type Action } from "~/components/structural";
import { Actions } from "~/components/structural/Actions";
import { ShowHide } from "~/components/util";

import { FormFieldErrors } from "../generic/Field/FieldErrors";
import { Form, type FormProps } from "../generic/Form";

import { type DetailFormValues } from "./types";

export interface DetailFormProps
  extends Omit<FormProps<DetailFormValues>, "children" | "contentClassName"> {
  readonly actions?: Action[];
  readonly isNew?: boolean;
}

export const DetailForm = React.memo(
  ({ actions, isNew, ...props }: DetailFormProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Form
        {...props}
        form={props.form}
        contentClassName="gap-[12px]"
        structure={({ footer, body }) => (
          <div className="flex flex-col">
            <div className="flex flex-row justify-between items-center">
              <Form.Field
                name="label"
                form={props.form}
                className="mr-[12px]"
                autoRenderErrors={false}
              >
                <TextInput
                  className="w-full p-0 outline-none"
                  {...props.form.register("label")}
                  placeholder="Label"
                  isReadOnly={!isNew && !isOpen}
                  fontWeight="medium"
                  size="small"
                />
              </Form.Field>
              <div className="flex flex-row gap-[6px] items-center">
                <Actions actions={actions} />
                {!isNew && (
                  <IconButton.Bare
                    key={actions ? actions.length : "0"}
                    size="xsmall"
                    onClick={() => setIsOpen(curr => !curr)}
                  >
                    <CaretIcon open={isOpen} />
                  </IconButton.Bare>
                )}
              </div>
            </div>
            <ShowHide show={isOpen === true || isNew === true}>
              <FormFieldErrors form={props.form} name="label" />
              <div className="flex flex-col mt-[4px]">
                {!isNew && body}
                {footer}
              </div>
            </ShowHide>
          </div>
        )}
      >
        <Form.Field
          name="description"
          label="Description"
          form={props.form}
          labelProps={{ size: "xs" }}
        >
          <TextArea
            className="w-full p-0 outline-none"
            autoSize={true}
            {...props.form.register("description")}
            size="small"
            placeholder={
              "A brief description of the detail that will appear on the " + "online portfolio."
            }
          />
        </Form.Field>
        <Form.Field
          name="shortDescription"
          label="Short Description"
          form={props.form}
          labelProps={{ size: "xs" }}
        >
          <TextArea
            className="w-full p-0 outline-none"
            autoSize={true}
            {...props.form.register("shortDescription")}
            /* This simply sets the text area to a single row unless it has content in it that spans
               multiple rows. */
            rows={1}
            placeholder="A shortened version of the description."
            size="small"
          />
        </Form.Field>
        <Form.ControlledField
          name="project"
          label="Project"
          form={props.form}
          helpText="The project that the detail is associated with, if applicable."
        >
          {({ value, onChange }) => (
            <ClientProjectSelect
              inputClassName="w-full"
              menuClassName="max-h-[260px]"
              value={value}
              options={{ isMulti: false }}
              onChange={onChange}
              inPortal
              onError={() =>
                props.form.setStaticErrors("project", "There was an error loading the data.")
              }
            />
          )}
        </Form.ControlledField>
      </Form>
    );
  },
);
