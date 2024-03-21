import { stringifyLocation } from "~/prisma/model";
import { getCompanies } from "~/actions/fetches/get-companies";
import { getSchools } from "~/actions/fetches/get-schools";
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

const queries: {
  [key in ModelType]: { params: (id: string) => { [key in string]: string }; clear: string[] };
} = {
  company: {
    params: id => ({ updateCompanyId: id }),
    clear: ["updateExperienceId", "updateExperienceDetailsId"],
  },
  school: {
    params: id => ({ updateSchoolId: id }),
    clear: ["updateEducationId", "updateEducationDetailsId"],
  },
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
          params: queries[modelType].params(id),
          clear: queries[modelType].clear,
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
