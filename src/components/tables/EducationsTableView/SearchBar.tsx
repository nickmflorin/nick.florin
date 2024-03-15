"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { TableSearchBar } from "~/components/tables/TableSearchBar";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"));

const CreateEducationForm = dynamic(
  () => import("~/components/forms/educations/CreateEducationForm"),
  {
    loading: () => <Loading loading={true} />,
  },
);

export interface SearchBarProps extends ComponentProps {}

export const SearchBar = (props: SearchBarProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <TableSearchBar {...props} searchParamName="search" onNew={() => setDrawerOpen(true)} />
      {drawerOpen && (
        <ClientDrawer onClose={() => setDrawerOpen(false)}>
          <CreateEducationForm className="mt-[16px]" onCancel={() => setDrawerOpen(false)} />
        </ClientDrawer>
      )}
    </>
  );
};

export default SearchBar;
