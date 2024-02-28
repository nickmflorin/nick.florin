"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { createSkill } from "~/actions/createSkill";
import { TableSearchBar } from "~/components/tables/TableSearchBar";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

const Drawer = dynamic(() => import("~/components/drawers/Drawer"), {
  loading: () => <Loading loading={true} />,
});

const CreateSkillForm = dynamic(() => import("~/components/forms/skills/CreateSkillForm"), {
  loading: () => <Loading loading={true} />,
});

export interface SkillsAdminTableControlBarProps extends ComponentProps {}

const createSkillAction = async (value: string) => {
  await createSkill({ label: value });
};

export const SkillsAdminTableSearchBar = (props: SkillsAdminTableControlBarProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <TableSearchBar
        {...props}
        searchParamName="search"
        onNew={() => setDrawerOpen(true)}
        onCreate={createSkillAction}
      />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <CreateSkillForm className="mt-[16px]" onCancel={() => setDrawerOpen(false)} />
      </Drawer>
    </>
  );
};

export default SkillsAdminTableSearchBar;
