"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "~/components/buttons";
import { Loading } from "~/components/views/Loading";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"));

const CreateExperienceForm = dynamic(
  () => import("~/components/forms/experiences/CreateExperienceForm"),
  {
    loading: () => <Loading loading={true} />,
  },
);

export const NewExperienceButton = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Button.Primary onClick={() => setDrawerOpen(true)}>New</Button.Primary>
      {drawerOpen && (
        <ClientDrawer onClose={() => setDrawerOpen(false)}>
          <CreateExperienceForm className="mt-[16px]" onCancel={() => setDrawerOpen(false)} />
        </ClientDrawer>
      )}
    </>
  );
};

export default NewExperienceButton;
