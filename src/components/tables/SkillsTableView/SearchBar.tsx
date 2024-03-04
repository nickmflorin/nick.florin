"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { createSkill } from "~/actions/create-skill";
import { TableSearchBar } from "~/components/tables/TableSearchBar";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

const Drawer = dynamic(() => import("~/components/drawers/Drawer"));

const CreateSkillForm = dynamic(() => import("~/components/forms/skills/CreateSkillForm"), {
  loading: () => <Loading loading={true} />,
});

export interface SearchBarProps extends ComponentProps {}

const createSkillAction = async (value: string) => {
  await createSkill({ label: value });
};

export const SearchBar = (props: SearchBarProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <TableSearchBar
        {...props}
        searchParamName="search"
        onNew={() => setDrawerOpen(true)}
        onCreate={createSkillAction}
      />
      {drawerOpen && (
        <Drawer onClose={() => setDrawerOpen(false)}>
          <CreateSkillForm className="mt-[16px]" onCancel={() => setDrawerOpen(false)} />
        </Drawer>
      )}
    </>
  );
};

export default SearchBar;
