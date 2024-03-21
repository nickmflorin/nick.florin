"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "~/components/buttons";
import { Floating } from "~/components/floating/Floating";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { Loading } from "~/components/views/Loading";

import { MenuContainer } from "../generic/MenuContainer";

import { CompaniesMenuFooter } from "./CompaniesMenuFooter";

const CreateCompanyForm = dynamic(() => import("~/components/forms/companies/CreateCompanyForm"), {
  ssr: false,
  loading: () => <Loading loading={true} />,
});

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), { ssr: false });

export interface CompaniesFloatingProps {
  readonly children: JSX.Element;
}

export const CompaniesFloating = (props: CompaniesFloatingProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateCompanyDrawer, setShowCreateCompanyDrawer] = useState(false);
  return (
    <>
      <Floating
        isOpen={isOpen}
        onOpenChange={v => setIsOpen(v)}
        content={
          <MenuContainer className="box-shadow-none">
            {props.children}
            <CompaniesMenuFooter
              onCreate={() => {
                setIsOpen(false);
                setShowCreateCompanyDrawer(true);
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
            Companies
          </Button.Secondary>
        )}
      </Floating>
      {showCreateCompanyDrawer && (
        <ClientDrawer onClose={() => setShowCreateCompanyDrawer(false)}>
          <CreateCompanyForm
            className="mt-[16px]"
            onCancel={() => setShowCreateCompanyDrawer(false)}
            onSuccess={() => setShowCreateCompanyDrawer(false)}
          />
        </ClientDrawer>
      )}
    </>
  );
};

export default CompaniesFloating;
