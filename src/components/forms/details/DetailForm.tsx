import React, { useState } from "react";

import { IconButton } from "~/components/buttons";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { TextInput } from "~/components/input/TextInput";
import { type Action } from "~/components/structural";
import { Actions } from "~/components/structural/Actions";
import { ShowHide } from "~/components/util";

import { FormFieldErrors } from "../generic/Field/FieldErrors";
import { Form, type FormProps } from "../generic/Form";

import { DetailFormFields } from "./DetailFormFields";
import { type DetailFormValues } from "./types";

export interface DetailFormProps
  extends Omit<FormProps<DetailFormValues>, "children" | "contentClassName"> {
  readonly actions?: Action[];
  readonly isNew?: boolean;
  readonly isExpanded: boolean;
}

export const DetailForm = React.memo(
  ({ actions, isNew, ...props }: DetailFormProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Form
        {...props}
        form={props.form}
        contentClassName="gap-[12px]"
        structure={
          !props.isExpanded
            ? ({ footer, body }) => (
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
              )
            : ({ footer, body }) => (
                <>
                  {body}
                  {footer}
                </>
              )
        }
      >
        <DetailFormFields form={props.form} isExpanded={props.isExpanded} />
      </Form>
    );
  },
);
