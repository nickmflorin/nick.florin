"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "~/components/buttons";
import { DrawerIds } from "~/components/drawers";
import { Loading } from "~/components/feedback/Loading";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

export const NewCourseButton = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Button.Primary onClick={() => setDrawerOpen(true)}>New</Button.Primary>
      {drawerOpen && <ClientDrawer id={DrawerIds.CREATE_COURSE} props={{}} />}
    </>
  );
};

export default NewCourseButton;
