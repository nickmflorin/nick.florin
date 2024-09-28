import { type ComponentProps, classNames } from "~/components/types";
import { Text } from "~/components/typography/Text";

export interface FormErrorProps extends ComponentProps {
  readonly children: string;
}

export const FormError = ({ children, ...props }: FormErrorProps): JSX.Element => (
  <Text {...props} fontSize="xs" className={classNames("text-danger-400", props.className)}>
    {children}
  </Text>
);
