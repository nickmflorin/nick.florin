import { useState } from "react";

import { IconButton } from "~/components/buttons";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";
import { type Action, mergeActions } from "~/components/structural";
import { Collapse } from "~/components/structural/Collapse";

import { Form, type FormProps } from "../generic/Form";

import { type DetailFormValues } from "./types";

export interface DetailFormProps
  extends Omit<FormProps<DetailFormValues>, "children" | "contentClassName"> {
  readonly actions?: Action[];
}

export const DetailForm = ({ actions, ...props }: DetailFormProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Form
      {...props}
      form={props.form}
      contentClassName="gap-[12px]"
      structure={({ header, footer, body }) => (
        <>
          {header}
          <Collapse
            open={isOpen}
            onToggle={() => setIsOpen(curr => !curr)}
            contentClassName="gap-[6px]"
            title={
              <Form.Field name="label" form={props.form} className="mr-[12px]">
                <TextInput
                  className="w-full p-0 outline-none"
                  {...props.form.register("label")}
                  isReadOnly={!isOpen}
                  fontWeight="medium"
                  size="medium"
                />
              </Form.Field>
            }
            actions={mergeActions(actions, [
              <IconButton.Bare
                className="text-red-600 hover:text-red-700"
                key="0"
                icon={{ name: "trash-alt" }}
                size="xsmall"
              />,
            ])}
          >
            {body}
            {footer}
          </Collapse>
        </>
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
    </Form>
  );
};
