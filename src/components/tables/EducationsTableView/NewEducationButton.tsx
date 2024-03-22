"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "~/components/buttons";
import { Loading } from "~/components/views/Loading";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"));

const CreateEducationForm = dynamic(
  () => import("~/components/forms/educations/CreateEducationForm"),
  {
    loading: () => <Loading loading={true} />,
  },
);

export const NewEducationButton = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Button.Primary onClick={() => setDrawerOpen(true)}>New</Button.Primary>
      {drawerOpen && (
        <ClientDrawer onClose={() => setDrawerOpen(false)} id="create-education">
          <CreateEducationForm className="mt-[16px]" onCancel={() => setDrawerOpen(false)} />
        </ClientDrawer>
      )}
    </>
  );
};

export default NewEducationButton;
