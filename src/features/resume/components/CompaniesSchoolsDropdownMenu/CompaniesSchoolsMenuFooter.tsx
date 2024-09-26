import { Button } from "~/components/buttons";
import { MenuFooter } from "~/components/menus/MenuFooter";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface CompaniesSchoolsMenuFooterProps extends ComponentProps {
  readonly onCreate: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const CompaniesSchoolsMenuFooter = ({
  onCreate,
  ...props
}: CompaniesSchoolsMenuFooterProps) => (
  <MenuFooter
    {...props}
    className={classNames(
      "w-full flex flex-row item-center justify-center px-[18px] pb-[12px] pt-[6px]",
      props.className,
    )}
  >
    <Button.Solid className="w-full" scheme="primary" element="button" onClick={e => onCreate(e)}>
      Create
    </Button.Solid>
  </MenuFooter>
);
