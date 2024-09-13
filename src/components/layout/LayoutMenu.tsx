import { type ISidebarItem, flattenSidebarItems } from "./types";

export interface LayoutMenuProps {
  readonly nav: ISidebarItem[];
}

export const LayoutMenu = ({ nav }: LayoutMenuProps) => (
  <div className="layout-menu">
    <div className="flex flex-col gap-[8px] items-center">
      {flattenSidebarItems(nav).map((item, index) => (
        <div key={index}>{item.label}</div>
      ))}
    </div>
  </div>
);
