"use client";
import { TabButton } from "~/components/buttons/TabButton";
import { DrawerIds } from "~/components/drawers";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";

export const ResumesAdminTab = () => {
  const { open, drawerId } = useDrawers();
  return (
    <TabButton
      element="button"
      icon={{ name: "list-check" }}
      isActive={drawerId === DrawerIds.VIEW_RESUMES}
      onClick={() => open(DrawerIds.VIEW_RESUMES, {})}
    >
      Resumes
    </TabButton>
  );
};
