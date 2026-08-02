'use client';
import dynamic from 'next/dynamic';

import { stringifyLocation } from '~/database/model';

import { type DrawerId, type DrawerIdPropsPair, DrawerIds } from '~/components/drawers';
import { useDrawers } from '~/components/drawers/hooks/use-drawers';
import { Loading } from '~/components/loading/Loading';
import { MenuItem } from '~/components/menus/MenuItem';
import { Description, Text } from '~/components/typography';

import { DeleteCompanySchoolButton } from './DeleteCompanySchoolButton';
import { type Model, type ModelType } from './types';

const MenuContent = dynamic(
  () => import('~/components/menus/MenuContent').then(mod => mod.MenuContent),
  { loading: () => <Loading isLoading /> },
);

export interface ClientCompaniesSchoolsMenuContentProps<M extends ModelType> {
  readonly data: Model<M>[];
  readonly modelType: M;
}

type ModelDrawerId = Extract<
  DrawerId,
  typeof DrawerIds.UPDATE_COMPANY | typeof DrawerIds.UPDATE_SCHOOL
>;

const ModelDrawerProps: {
  [key in ModelType]: (model: Model<key>) => DrawerIdPropsPair<ModelDrawerId>;
} = {
  company: model => ({
    id: DrawerIds.UPDATE_COMPANY,
    props: { companyId: model.id, eager: { name: model.name } },
  }),
  school: model => ({
    id: DrawerIds.UPDATE_SCHOOL,
    props: { eager: { name: model.name }, schoolId: model.id },
  }),
};

export const ClientCompaniesSchoolsMenuContent = <M extends ModelType>({
  data,
  modelType,
}: ClientCompaniesSchoolsMenuContentProps<M>) => {
  const { open } = useDrawers();
  return (
    <MenuContent>
      {data.map(model => (
        <MenuItem
          actions={[<DeleteCompanySchoolButton key='0' model={model} modelType={modelType} />]}
          className='px-[18px] first:pt-[12px]'
          id={model.id}
          key={model.id}
          onClick={() =>
            open(ModelDrawerProps[modelType](model).id, ModelDrawerProps[modelType](model).props)
          }
        >
          <div className='flex flex-col gap-[4px]'>
            <Text fontSize='sm' fontWeight='medium'>
              {model.name}
            </Text>
            <Description fontSize='xs'>
              {stringifyLocation({ city: model.city, state: model.state })}
            </Description>
          </div>
        </MenuItem>
      ))}
    </MenuContent>
  );
};
