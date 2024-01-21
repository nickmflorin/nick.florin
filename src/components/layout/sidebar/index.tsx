import { SidebarAnchor } from "~/components/buttons/SidebarAnchor";

import { SidebarItems } from "./config";

export const Sidebar = () => (
  <div className="sidebar">
    {SidebarItems.map((item, i) => (
      <SidebarAnchor key={i} icon={item.icon} />
    ))}
  </div>
);
