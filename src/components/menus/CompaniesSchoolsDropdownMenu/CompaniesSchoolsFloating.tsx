"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "~/components/buttons";
import { DrawerIds } from "~/components/drawers";
import { Floating } from "~/components/floating/Floating";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { ShowHide } from "~/components/util";
import { Loading } from "~/components/views/Loading";

import { MenuContainer } from "../generic/MenuContainer";

import { CompaniesSchoolsMenuFooter } from "./CompaniesSchoolsMenuFooter";
import { type ModelType } from "./types";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), {
  loading: () => <Loading loading={true} />,
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
  const [isOpen, setIsOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  return (
    <>
      <Floating
        isOpen={isOpen}
        onOpenChange={v => setIsOpen(v)}
        content={
          <MenuContainer className="box-shadow-none">
            {children}
            <CompaniesSchoolsMenuFooter
              onCreate={() => {
                setIsOpen(false);
                setDrawerVisible(true);
              }}
            />
          </MenuContainer>
        }
        placement="bottom-end"
        triggers={["click"]}
        offset={{ mainAxis: 4 }}
        withArrow={false}
        width={400}
        className="p-[0px] rounded-md overflow-hidden"
        variant="white"
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
      </Floating>
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
