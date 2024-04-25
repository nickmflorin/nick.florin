import dynamic from "next/dynamic";

import type * as types from "../types";

import { stringifyLocation } from "~/prisma/model";
import { getCompanies } from "~/actions/fetches/companies";
import { getSchools } from "~/actions/fetches/schools";
import { type DrawerId, DrawerIds, type DrawerIdPropsPair } from "~/components/drawers";
import { Loading } from "~/components/feedback/Loading";
import { Text } from "~/components/typography/Text";

import { DeleteCompanySchoolButton } from "./DeleteCompanySchoolButton";
import { type ModelType, type Model } from "./types";

const MenuContent = dynamic(() => import("../generic/MenuContent"), {
  loading: () => <Loading isLoading={true} />,
}) as types.MenuContentComponent;

export interface CompaniesSchoolsMenuContentProps<M extends ModelType> {
  readonly modelType: M;
}

const fetchers: { [key in ModelType]: () => Promise<Model<key>[]> } = {
  company: async () => await getCompanies({ includes: ["experiences"], visibility: "admin" }),
  school: async () => await getSchools({ includes: ["educations"], visibility: "admin" }),
};

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

const getDrawer = <T extends ModelType>(
  modelType: T,
  model: Model<T>,
): DrawerIdPropsPair<(typeof ModelDrawerIds)[T]> => ModelDrawerProps[modelType](model);

export const CompaniesSchoolsMenuContent = async <M extends ModelType>({
  modelType,
}: CompaniesSchoolsMenuContentProps<M>) => {
  const data = await fetchers[modelType]();
  return (
    <MenuContent
      itemClassName="px-[18px] first:pt-[12px]"
      options={{}}
      data={data.map(model => ({
        id: model.id,
        drawer: getDrawer(modelType, model),
        actions: [<DeleteCompanySchoolButton key="0" modelType={modelType} model={model} />],
        label: (
          <div className="flex flex-col gap-[4px]">
            <Text fontSize="sm" fontWeight="medium">
              {model.name}
            </Text>
            <Text fontSize="xs" className="text-body-light">
              {stringifyLocation({ city: model.city, state: model.state })}
            </Text>
          </div>
        ),
      }))}
    />
  );
};
