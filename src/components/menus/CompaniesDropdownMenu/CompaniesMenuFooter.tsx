import clsx from "clsx";

import { Button } from "~/components/buttons";
import { type ComponentProps } from "~/components/types";

import { MenuFooter } from "../generic/MenuFooter";

export interface CompaniesMenuFooterProps extends ComponentProps {
  readonly onCreate: () => void;
}

export const CompaniesMenuFooter = ({ onCreate, ...props }: CompaniesMenuFooterProps) => (
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
