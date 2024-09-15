import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography";

export interface FormFieldErrorProps extends ComponentProps {
  readonly children: string;
}

export const FormFieldError = ({ children, ...props }: FormFieldErrorProps): JSX.Element => (
  <Text {...props} fontSize="xs" className={classNames("text-danger-400", props.className)}>
    {children}
  </Text>
);
