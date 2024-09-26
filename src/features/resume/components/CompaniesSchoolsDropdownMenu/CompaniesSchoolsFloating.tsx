"use client";
import { UnreachableCaseError } from "~/application/errors";

import { Button } from "~/components/buttons";
import { DrawerIds } from "~/components/drawers";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { Popover } from "~/components/floating/Popover";
import { PopoverContent } from "~/components/floating/PopoverContent";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { Menu } from "~/components/menus/Menu";

import { CompaniesSchoolsMenuFooter } from "./CompaniesSchoolsMenuFooter";
import { type ModelType } from "./types";

const ButtonContent: { [key in ModelType]: string } = {
  company: "Companies",
  school: "Schools",
};

export interface CompaniesSchoolsFloatingProps {
  readonly modelType: ModelType;
  readonly content: JSX.Element;
}

export const CompaniesSchoolsFloating = ({ content, modelType }: CompaniesSchoolsFloatingProps) => {
  const { open } = useDrawers();
  return (
    <Popover
      content={content}
      withArrow={false}
      maxHeight={400}
      outerContent={({ children, setIsOpen }) => (
        <PopoverContent className="p-[0px] rounded-md overflow-hidden z-50">
          <Menu className="box-shadow-none">
            {children}
            <CompaniesSchoolsMenuFooter
              onCreate={e => {
                if (modelType === "company") {
                  open(DrawerIds.CREATE_COMPANY, {});
                  setIsOpen(false, e);
                } else if (modelType === "school") {
                  open(DrawerIds.CREATE_SCHOOL, {});
                  setIsOpen(false, e);
                } else {
                  throw new UnreachableCaseError();
                }
              }}
            />
          </Menu>
        </PopoverContent>
      )}
      placement="bottom-end"
      triggers={["click"]}
      offset={{ mainAxis: 4 }}
      width={400}
    >
      {({ ref, params, isOpen }) => (
        <Button.Solid
          ref={ref}
          {...params}
          scheme="secondary"
          icon={{
            right: <CaretIcon open={isOpen} />,
          }}
        >
          {ButtonContent[modelType]}
        </Button.Solid>
      )}
    </Popover>
  );
};

export default CompaniesSchoolsFloating;
