"use client";
import { EllipsisButton } from "~/components/buttons/EllipsisButton";
import { Floating } from "~/components/floating/Floating";

export interface CompaniesDropdownMenuProps {
  readonly menu: JSX.Element;
}

export const CompaniesDropdownMenu = ({ menu }: CompaniesDropdownMenuProps) => (
  <Floating
    content={menu}
    placement="bottom-end"
    triggers={["click"]}
    offset={{ mainAxis: 4 }}
    withArrow={false}
    width={400}
    className="p-[0px] rounded-md overflow-y-scroll"
    variant="white"
  >
    {({ ref, params, isOpen }) => <EllipsisButton ref={ref} {...params} isActive={isOpen} />}
  </Floating>
);
