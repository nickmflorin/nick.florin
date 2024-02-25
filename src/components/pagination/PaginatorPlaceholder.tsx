import { Pagination } from "@mantine/core";
import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface PaginatorPlaceholderProps extends Pick<ComponentProps, "className"> {}

export const PaginatorPlaceholder = (props: PaginatorPlaceholderProps) => (
  <Pagination className={clsx("paginator", props.className)} value={1} total={1} />
);

export default PaginatorPlaceholder;
