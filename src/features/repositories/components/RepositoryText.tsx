import type { BrandRepository } from "~/database/model";

import { classNames } from "~/components/types";
import type { TextProps } from "~/components/typography";
import { Text } from "~/components/typography";

export type RepositoryTextProps = Omit<TextProps<"div">, "children"> & {
  readonly repository: BrandRepository;
};

export const RepositoryText = ({ repository, ...props }: RepositoryTextProps): JSX.Element => (
  <Text
    fontWeight="medium"
    fontSize="sm"
    {...props}
    component="div"
    className={classNames("text-blue-900", props.className)}
  >
    {repository.slug}
  </Text>
);
