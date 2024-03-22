import { stringifyLocation } from "~/prisma/model";
import { getCompanies } from "~/actions/fetches/get-companies";
import { getSchools } from "~/actions/fetches/get-schools";
import { type QueryDrawerId, QueryDrawerIds } from "~/components/drawers";
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

const DrawerParams: {
  [key in ModelType]: QueryDrawerId;
} = {
  company: QueryDrawerIds.UPDATE_COMPANY,
  school: QueryDrawerIds.UPDATE_SCHOOL,
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
          param: DrawerParams[modelType],
          value: id,
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
