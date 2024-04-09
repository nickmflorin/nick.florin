import { type ReactNode } from "react";

import clsx from "clsx";

import { Loading } from "~/components/feedback/Loading";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";

import { FormErrors } from "./FormErrors";
import { type FormInstance, type BaseFormValues } from "./types";

export { type NativeFormProps } from "./NativeForm";
export * from "./types";

export type FormStructureProps<I extends BaseFormValues> = {
  readonly form: FormInstance<I>;
  readonly contentClassName?: ComponentProps["className"];
  readonly footer?: JSX.Element;
  readonly footerClassName?: ComponentProps["className"];
  readonly title?: string | JSX.Element | JSX.Element[];
  readonly isLoading?: boolean;
  readonly isScrollable?: boolean;
  readonly children?: ReactNode;
  readonly structure?: (params: {
    header: JSX.Element;
    body?: JSX.Element;
    footer: JSX.Element;
  }) => JSX.Element;
};

const Header = <I extends BaseFormValues>({ title }: Pick<FormStructureProps<I>, "title">) => (
  <>
    {typeof title === "string" ? (
      <Title order={4} className="mb-4">
        {title}
      </Title>
    ) : title ? (
      <div className="flex flex-col mb-4">{title}</div>
    ) : null}
  </>
);

const Body = <I extends BaseFormValues>({
  isLoading = false,
  isScrollable = true,
  contentClassName,
  children,
}: Pick<FormStructureProps<I>, "isLoading" | "isScrollable" | "children" | "contentClassName">) => (
  <div
    className={clsx("flex flex-col grow relative", {
      "overflow-y-auto pr-[18px]": isScrollable,
    })}
  >
    <Loading isLoading={isLoading}>
      <div className={clsx("flex flex-col gap-[8px]", contentClassName)}>{children}</div>
    </Loading>
  </div>
);

const Footer = <I extends BaseFormValues>({
  footer,
  footerClassName,
  isScrollable = true,
  form,
}: Pick<FormStructureProps<I>, "form" | "footer" | "footerClassName" | "isScrollable">) => (
  <>
    {(form.errors.length !== 0 || footer) && (
      <div
        className={clsx("flex flex-col mt-[16px]", { "pr-[18px]": isScrollable }, footerClassName)}
      >
        <FormErrors form={form} className="my-[4px]" />
        {footer}
      </div>
    )}
  </>
);

export const FormStructure = <I extends BaseFormValues>({
  title,
  isScrollable = true,
  isLoading,
  contentClassName,
  footerClassName,
  children,
  form,
  footer,
  structure,
}: FormStructureProps<I>) =>
  structure ? (
    structure({
      body: children ? (
        <Body isLoading={isLoading} isScrollable={isScrollable} contentClassName={contentClassName}>
          {children}
        </Body>
      ) : undefined,
      footer: (
        <Footer
          footer={footer}
          footerClassName={footerClassName}
          isScrollable={isScrollable}
          form={form}
        />
      ),
      header: <Header title={title} />,
    })
  ) : (
    <>
      <Header title={title} />
      <Body isLoading={isLoading} isScrollable={isScrollable} contentClassName={contentClassName}>
        {children}
      </Body>
      <Footer
        footer={footer}
        footerClassName={footerClassName}
        isScrollable={isScrollable}
        form={form}
      />
    </>
  );
