"use client";
import { UnreachableCaseError } from "~/application/errors";

import { Button } from "~/components/buttons";
import { DrawerIds } from "~/components/drawers";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { Popover } from "~/components/floating/Popover";
import { PopoverContent } from "~/components/floating/PopoverContent";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { MenuContainer } from "~/components/menus/MenuContainer";

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
      outerContent={({ children }) => (
        <PopoverContent className="p-[0px] rounded-md overflow-hidden" variant="white">
          <MenuContainer className="box-shadow-none">
            {children}
            <CompaniesSchoolsMenuFooter
              onCreate={() => {
                if (modelType === "company") {
                  open(DrawerIds.CREATE_COMPANY, {});
                } else if (modelType === "school") {
                  open(DrawerIds.CREATE_SCHOOL, {});
                } else {
                  throw new UnreachableCaseError();
                }
              }}
            />
          </MenuContainer>
        </PopoverContent>
      )}
      placement="bottom-end"
      triggers={["click"]}
      offset={{ mainAxis: 4 }}
      width={400}
      maxHeight={600}
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
