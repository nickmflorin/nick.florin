"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "~/components/buttons";
import { DrawerIds } from "~/components/drawers";
import { Loading } from "~/components/feedback/Loading";
import { Popover } from "~/components/floating/Popover";
import { PopoverContent } from "~/components/floating/PopoverContent";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { ShowHide } from "~/components/util";

import { MenuContainer } from "../generic/MenuContainer";

import { CompaniesSchoolsMenuFooter } from "./CompaniesSchoolsMenuFooter";
import { type ModelType } from "./types";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), {
  loading: () => <Loading isLoading={true} />,
  ssr: false,
});

const ButtonContent: { [key in ModelType]: string } = {
  company: "Companies",
  school: "Schools",
};

export interface CompaniesSchoolsFloatingProps<M extends ModelType> {
  readonly children: JSX.Element;
  readonly modelType: M;
}

export const CompaniesSchoolsFloating = <M extends ModelType>({
  children,
  modelType,
}: CompaniesSchoolsFloatingProps<M>) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  return (
    <>
      <Popover
        withArrow={false}
        content={
          <PopoverContent className="p-[0px] rounded-md overflow-hidden" variant="white">
            <MenuContainer className="box-shadow-none">
              {children}
              <CompaniesSchoolsMenuFooter onCreate={() => setDrawerVisible(true)} />
            </MenuContainer>
          </PopoverContent>
        }
        placement="bottom-end"
        triggers={["click"]}
        offset={{ mainAxis: 4 }}
        width={400}
        maxHeight={600}
      >
        {({ ref, params, isOpen }) => (
          <Button.Secondary
            ref={ref}
            {...params}
            icon={{
              right: <CaretIcon open={isOpen} />,
            }}
          >
            {ButtonContent[modelType]}
          </Button.Secondary>
        )}
      </Popover>
      <ShowHide show={drawerVisible && modelType === "company"}>
        <ClientDrawer id={DrawerIds.CREATE_COMPANY} props={{}} />
      </ShowHide>
      <ShowHide show={drawerVisible && modelType === "school"}>
        <ClientDrawer id={DrawerIds.CREATE_SCHOOL} props={{}} />
      </ShowHide>
    </>
  );
};

export default CompaniesSchoolsFloating;
