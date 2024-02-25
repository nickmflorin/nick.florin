"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import clsx from "clsx";

import { Button } from "~/components/buttons/generic";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

import { SearchInput } from "./SearchInput";

const Drawer = dynamic(() => import("~/components/drawers/Drawer"), {
  loading: () => <Loading loading={true} />,
});

const CreateSkillForm = dynamic(() => import("~/components/forms/skill/CreateSkillForm"), {
  loading: () => <Loading loading={true} />,
});

export interface SkillsAdminTableControlBarProps extends ComponentProps {}

export const SkillsAdminTableControlBar = (props: SkillsAdminTableControlBarProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div {...props} className={clsx("flex flex-row w-full gap-[8px]", props.className)}>
        <SearchInput />
        <Button.Primary onClick={() => setDrawerOpen(true)}>New</Button.Primary>
      </div>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <CreateSkillForm />
      </Drawer>
    </>
  );
};
