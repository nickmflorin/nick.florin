"use client";
import { type ButtonVariant } from "~/components/buttons";
import { Button } from "~/components/buttons/generic";
import { useNavigatable, type NavItem } from "~/hooks";

export interface NavButtonItem extends NavItem {
  readonly label: string;
  readonly button?: ButtonVariant<"link">;
}

export interface SideNavItemProps {
  readonly item: NavButtonItem;
}

export const SideNavItem = ({
  item: { button = "primary", icon, label, ...item },
}: SideNavItemProps) => {
  const { isActive, href, setActiveOptimistically, isPending } = useNavigatable({ item });
  return (
    <Button
      variant={button}
      options={{ as: "link" }}
      icon={icon}
      href={href}
      isActive={isActive}
      isLoading={isPending}
      onClick={() => setActiveOptimistically(true)}
    >
      {label}
    </Button>
  );
};
export default SideNavItem;
