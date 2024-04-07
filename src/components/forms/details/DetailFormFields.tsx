import React from "react";

import clsx from "clsx";

import { ClientProjectSelect } from "~/components/input/select/ClientProjectSelect";
import { TextArea } from "~/components/input/TextArea";
import { TextInput } from "~/components/input/TextInput";
import { ShowHide } from "~/components/util";

import { CheckboxField } from "../fields/CheckboxField";
import { Form, type FormProps } from "../generic/Form";

import { type DetailFormValues } from "./types";

export interface DetailFormProps extends Pick<FormProps<DetailFormValues>, "form"> {
  readonly isExpanded: boolean;
}

export const DetailFormFields = ({ form, isExpanded }: DetailFormProps): JSX.Element => (
  <>
    <ShowHide show={isExpanded}>
      <Form.Field
        name="label"
        form={form}
        label="Label"
        autoRenderErrors={false}
        labelProps={{ size: "xs" }}
      >
        <TextInput
          className={clsx("w-full", { "p-0 outline-none": !isExpanded })}
          {...form.register("label")}
          placeholder="Label"
          fontWeight={isExpanded ? "regular" : "medium"}
          size="small"
        />
      </Form.Field>
    </ShowHide>
    <Form.Field name="description" label="Description" form={form} labelProps={{ size: "xs" }}>
      <TextArea
        className={clsx("w-full", { "p-0 outline-none": !isExpanded })}
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
      form={form}
      labelProps={{ size: "xs" }}
    >
      <TextArea
        className={clsx("w-full", { "p-0 outline-none": !isExpanded })}
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
      name="project"
      label="Project"
      labelProps={{ size: "xs" }}
      form={form}
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
          onError={() => form.setStaticErrors("project", "There was an error loading the data.")}
        />
      )}
    </Form.ControlledField>
    <ShowHide show={isExpanded}>
      <CheckboxField name="visible" form={form} label="Visible" />
    </ShowHide>
  </>
);
