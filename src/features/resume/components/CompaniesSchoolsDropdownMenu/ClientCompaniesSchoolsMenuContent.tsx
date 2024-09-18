"use client";
import dynamic from "next/dynamic";

import { stringifyLocation } from "~/database/model";

import { DrawerIds, type DrawerId, type DrawerIdPropsPair } from "~/components/drawers";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { Loading } from "~/components/loading/Loading";
import { MenuItem } from "~/components/menus/MenuItem";
import { Text, Description } from "~/components/typography";

import { DeleteCompanySchoolButton } from "./DeleteCompanySchoolButton";
import { type ModelType, type Model } from "./types";

const MenuContent = dynamic(() => import("~/components/menus/MenuContent"), {
  loading: () => <Loading isLoading={true} />,
});

export interface ClientCompaniesSchoolsMenuContentProps<M extends ModelType> {
  readonly modelType: M;
  readonly data: Model<M>[];
}

type ModelDrawerId = Extract<
  DrawerId,
  typeof DrawerIds.UPDATE_COMPANY | typeof DrawerIds.UPDATE_SCHOOL
>;

const ModelDrawerIds: {
  [key in ModelType]: ModelDrawerId;
} = {
  company: DrawerIds.UPDATE_COMPANY,
  school: DrawerIds.UPDATE_SCHOOL,
};

const ModelDrawerProps: {
  [key in ModelType]: (model: Model<key>) => DrawerIdPropsPair<(typeof ModelDrawerIds)[key]>;
} = {
  company: model => ({
    id: DrawerIds.UPDATE_COMPANY,
    props: { companyId: model.id, eager: { name: model.name } },
  }),
  school: model => ({
    id: DrawerIds.UPDATE_SCHOOL,
    props: { schoolId: model.id, eager: { name: model.name } },
  }),
};

export const ClientCompaniesSchoolsMenuContent = async <M extends ModelType>({
  data,
  modelType,
}: ClientCompaniesSchoolsMenuContentProps<M>) => {
  const { open } = useDrawers();
  return (
    <MenuContent>
      {data.map(model => (
        <MenuItem
          className="px-[18px] first:pt-[12px]"
          key={model.id}
          id={model.id}
          actions={[<DeleteCompanySchoolButton key="0" modelType={modelType} model={model} />]}
          onClick={() =>
            open(ModelDrawerProps[modelType](model).id, ModelDrawerProps[modelType](model).props)
          }
        >
          <div className="flex flex-col gap-[4px]">
            <Text fontSize="sm" fontWeight="medium">
              {model.name}
            </Text>
            <Description fontSize="xs">
              {stringifyLocation({ city: model.city, state: model.state })}
            </Description>
          </div>
        </MenuItem>
      ))}
    </MenuContent>
  );
};
