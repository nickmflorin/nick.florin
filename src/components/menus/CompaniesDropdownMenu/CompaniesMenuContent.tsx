import { stringifyLocation } from "~/prisma/model";
import { getCompanies } from "~/actions/fetches/get-companies";
import { Text } from "~/components/typography/Text";

import { MenuContent } from "../generic/MenuContent";

export const CompaniesMenuContent = async () => {
  const companies = await getCompanies();
  return (
    <MenuContent
      itemClassName="px-[18px] first:pt-[12px]"
      options={{}}
      data={companies.map(({ id, city, state, name }) => ({
        id,
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
