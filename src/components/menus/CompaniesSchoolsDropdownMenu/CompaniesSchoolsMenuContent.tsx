import { stringifyLocation } from "~/prisma/model";
import { getCompanies } from "~/actions/fetches/get-companies";
import { getSchools } from "~/actions/fetches/get-schools";
import { type DrawerId, DrawerIds } from "~/components/drawers";
import { Text } from "~/components/typography/Text";

import { MenuContent } from "../generic/MenuContent";

import { type ModelType, type Model } from "./types";

export interface CompaniesSchoolsMenuContentProps<M extends ModelType> {
  readonly modelType: M;
}

const fetchers: { [key in ModelType]: () => Promise<Model<key>[]> } = {
  company: getCompanies,
  school: getSchools,
};

const ModelDrawerIds: {
  [key in ModelType]: DrawerId;
} = {
  company: DrawerIds.UPDATE_COMPANY,
  school: DrawerIds.UPDATE_SCHOOL,
};

const ModelDrawerPropNames: {
  [key in ModelType]: string;
} = {
  company: "companyId",
  school: "schoolId",
};

export const CompaniesSchoolsMenuContent = async <M extends ModelType>({
  modelType,
}: CompaniesSchoolsMenuContentProps<M>) => {
  const data = await fetchers[modelType]();
  return (
    <MenuContent
      itemClassName="px-[18px] first:pt-[12px]"
      options={{}}
      data={data.map(({ id, city, state, name }) => ({
        id,
        query: {
          drawerId: ModelDrawerIds[modelType],
          props: { [ModelDrawerPropNames[modelType]]: id },
        },
        label: (
          <div className="flex flex-col gap-[4px]">
            <Text size="sm" fontWeight="medium">
              {name}
            </Text>
            <Text size="xs" className="text-body-light">
              {stringifyLocation({ city, state })}
            </Text>
          </div>
        ),
      }))}
    />
  );
};
