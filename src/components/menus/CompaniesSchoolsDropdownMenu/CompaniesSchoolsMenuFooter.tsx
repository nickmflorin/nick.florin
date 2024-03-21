import clsx from "clsx";

import { Button } from "~/components/buttons";
import { type ComponentProps } from "~/components/types";

import { MenuFooter } from "../generic/MenuFooter";

export interface CompaniesSchoolsMenuFooterProps extends ComponentProps {
  readonly onCreate: () => void;
}

export const CompaniesSchoolsMenuFooter = ({
  onCreate,
  ...props
}: CompaniesSchoolsMenuFooterProps) => (
  <MenuFooter
    {...props}
    className={clsx(
      "w-full flex flex-row item-center justify-center px-[18px] pb-[12px] pt-[6px]",
      props.className,
    )}
  >
    <Button.Primary className="w-full" onClick={() => onCreate()}>
      Create
    </Button.Primary>
  </MenuFooter>
);
