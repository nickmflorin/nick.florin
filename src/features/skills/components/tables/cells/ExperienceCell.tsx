import { type JSX } from 'react';

import { Icon } from '~/components/icons/Icon';
import { Text } from '~/components/typography';
import { type SkillsTableModel } from '~/features/skills/types';

interface ExperienceCellProps {
  readonly skill: SkillsTableModel;
}

export const ExperienceCell = ({ skill }: ExperienceCellProps): JSX.Element => (
  <div className='flex flex-row gap-2 items-center justify-center'>
    <Text className='w-[14px]' fontSize='sm' fontWeight='medium'>
      {skill.calculatedExperience}
    </Text>
    <Text
      className='text-gray-600 flex flex-row items-center w-[32px]'
      fontSize='sm'
      fontWeight='regular'
    >
      <Text component='span'>(</Text>
      {skill.experience === null || skill.experience === 0 ? (
        <div className='flex flex-row items-center gap-1'>
          <Icon className='text-green-700' icon='check' size='16px' />
          <Text component='span' fontSize='xs'>
            Auto
          </Text>
        </div>
      ) : (
        <div className='flex flex-row items-center gap-1'>
          <Icon className='text-gray-400' icon='circle-xmark' iconStyle='solid' size='14px' />
          <Text component='span' fontSize='xs'>
            Manual
          </Text>
        </div>
      )}
      <Text component='span'>)</Text>
    </Text>
  </div>
);
