"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { TableSearchBar } from "~/components/tables/TableSearchBar";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"));

const CreateExperienceForm = dynamic(
  () => import("~/components/forms/experiences/CreateExperienceForm"),
  {
    loading: () => <Loading loading={true} />,
  },
);

export interface SearchBarProps extends ComponentProps {
  readonly companiesMenu: JSX.Element;
}

export const SearchBar = ({ companiesMenu, ...props }: SearchBarProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <TableSearchBar {...props} searchParamName="search" onNew={() => setDrawerOpen(true)}>
        {companiesMenu}
      </TableSearchBar>
      {drawerOpen && (
        <ClientDrawer onClose={() => setDrawerOpen(false)}>
          <CreateExperienceForm className="mt-[16px]" onCancel={() => setDrawerOpen(false)} />
        </ClientDrawer>
      )}
    </>
  );
};

export default SearchBar;
