import { useState } from "react";

import clsx from "clsx";

import { TextInput } from "~/components/input/TextInput";
import { type ComponentProps } from "~/components/types";

export interface MenuHeaderProps extends ComponentProps {
  readonly children?: JSX.Element;
  readonly search?: string;
  readonly onSearch?: (e: React.ChangeEvent<HTMLInputElement>, v: string) => void;
}

export const MenuHeader = ({
  children,
  search,
  onSearch,
  ...props
}: MenuHeaderProps): JSX.Element => {
  const [_search, setSearch] = useState("");
  if (children || search || onSearch) {
    return (
      <div {...props} className={clsx("menu__header", props.className)}>
        {onSearch && (
          <TextInput
            value={search ?? _search}
            onChange={e => {
              setSearch(e.target.value);
              onSearch(e, e.target.value);
            }}
          />
        )}
        {children}
      </div>
    );
  }
  return <></>;
};
