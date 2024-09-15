"use client";
import { useWatch } from "react-hook-form";
import { type PickByValueExact } from "utility-types";

import type { BaseFormValues, FormInstance, FieldName } from "~/components/forms";
import { classNames } from "~/components/types";
import { Title } from "~/components/typography";

import { Drawer } from "./Drawer";

interface DrawerFormProps<I extends BaseFormValues> {
  readonly form: FormInstance<I>;
  readonly titleField: keyof PickByValueExact<I, string> & FieldName<I>;
  readonly titlePlaceholder?: string;
  readonly eagerTitle?: string;
  readonly children: JSX.Element;
}

export const DrawerForm = <I extends BaseFormValues>({
  form,
  titleField,
  children,
  eagerTitle,
  titlePlaceholder,
}: DrawerFormProps<I>): JSX.Element => {
  const _titleValue = useWatch({ control: form.control, name: titleField });
  const titleValue = typeof _titleValue === "string" ? _titleValue : "";

  return (
    <Drawer>
      <Drawer.Header>
        {titleValue.trim().length === 0 && (eagerTitle || titlePlaceholder) ? (
          <Title
            component="h4"
            className={classNames({ "text-gray-300": titlePlaceholder !== undefined })}
          >
            {titlePlaceholder ?? eagerTitle}
          </Title>
        ) : (
          <Title component="h4">{titleValue}</Title>
        )}
      </Drawer.Header>
      <Drawer.Content className="overflow-y-hidden">{children}</Drawer.Content>
    </Drawer>
  );
};

export default DrawerForm;
