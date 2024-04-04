import { stringifyLocation } from "~/prisma/model";
import { getCompanies } from "~/actions/fetches/companies";
import { getSchools } from "~/actions/fetches/schools";
import { type DrawerId, DrawerIds } from "~/components/drawers";
import { Text } from "~/components/typography/Text";

import { MenuContent } from "../generic/MenuContent";

import { DeleteCompanySchoolButton } from "./DeleteCompanySchoolButton";
import { type ModelType, type Model } from "./types";

export interface CompaniesSchoolsMenuContentProps<M extends ModelType> {
  readonly modelType: M;
}

const fetchers: { [key in ModelType]: () => Promise<Model<key>[]> } = {
  company: async () => await getCompanies({ includes: ["experiences"] }),
  school: async () => await getSchools({ includes: ["educations"] }),
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
      data={data.map(model => ({
        id: model.id,
        query: {
          drawerId: ModelDrawerIds[modelType],
          props: { [ModelDrawerPropNames[modelType]]: model.id },
        },
        actions: [<DeleteCompanySchoolButton key="0" modelType={modelType} model={model} />],
        label: (
          <div className="flex flex-col gap-[4px]">
            <Text size="sm" fontWeight="medium">
              {model.name}
            </Text>
            <Text size="xs" className="text-body-light">
              {stringifyLocation({ city: model.city, state: model.state })}
            </Text>
          </div>
        ),
      }))}
    />
  );
};
