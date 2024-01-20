import { IconButton } from "~/components/buttons/generic/IconButton";

import { SidebarItems } from "./config";

export const Sidebar = () => (
  <div className="sidebar">
    {SidebarItems.map((item, i) => (
      <IconButton key={i} icon={item.icon} className="w-full" />
    ))}
  </div>
);
