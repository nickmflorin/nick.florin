import { TextInput } from "~/components/input/TextInput";
import { classNames } from "~/components/types";
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
  /* Note: We may want to allow the search to be uncontrolled here - but that would require state
     and turning this into a client component. */
  if (children || search || onSearch) {
    return (
      <div {...props} className={classNames("menu__header", props.className)}>
        {onSearch && <TextInput value={search} onChange={e => onSearch(e, e.target.value)} />}
        {children}
      </div>
    );
  }
  return <></>;
};
