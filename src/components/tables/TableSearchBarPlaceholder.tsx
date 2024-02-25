import { TextInput } from "@mantine/core";
import clsx from "clsx";

import { Button } from "~/components/buttons/generic";
import { type ComponentProps } from "~/components/types";

export interface TableSearchBarPlaceholderProps extends ComponentProps {}

export const TableSearchBarPlaceholder = (props: TableSearchBarPlaceholderProps) => (
  <div {...props} className={clsx("flex flex-row w-full gap-[8px]", props.className)}>
    <TextInput />
    <Button.Primary>New</Button.Primary>
  </div>
);
