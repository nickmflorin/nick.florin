import { type IconProp } from "~/components/icons";

export type SidebarItemConfig = {
  readonly icon: IconProp;
  readonly label: string;
};

export const SidebarItems: SidebarItemConfig[] = [{ label: "Experience", icon: { name: "house" } }];
