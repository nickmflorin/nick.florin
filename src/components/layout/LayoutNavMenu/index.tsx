import { type ILayoutNavItem, flattenLayoutNavItems } from "../types";

export { type ILayoutNavItem } from "../types";

export interface LayoutNavProps {
  readonly items: ILayoutNavItem[];
}

export const LayoutNav = ({ items }: LayoutNavProps) => (
  <div className="layout-nav-menu">
    <div className="flex flex-col gap-[8px] items-center">
      {flattenLayoutNavItems(items).map((item, index) => (
        <div key={index}>{item.tooltipLabel}</div>
      ))}
    </div>
  </div>
);
