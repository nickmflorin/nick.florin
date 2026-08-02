import { Icon } from '~/components/icons/Icon';
import { Circle } from '~/components/icons/svgs';
import { Label, Text } from '~/components/typography';

import { type SkillsBarChartDatum } from './types';

export const SkillsBarChartTooltip = (props: {
  readonly color: string;
  readonly data: SkillsBarChartDatum;
}) => (
  <>
    <div className='flex flex-row gap-[4px] items-center'>
      <div className='flex flex-row gap-[4px] items-center max-w-fit'>
        <Circle color={props.color} size={12} />
        <Label className='leading-[14px]' fontSize='xs'>
          {props.data.label}
        </Label>
      </div>
      <Text
        className='leading-[14px]'
        fontSize='xs'
        fontWeight='bold'
      >{`${props.data.experience} years`}</Text>
    </div>
    <div className='flex flex-row gap-[4px] items-flex-start w-[200px]'>
      <Icon className='text-blue-800' icon='info-circle' size='sm' />
      <Text className='text-description leading-[14px]' fontSize='xs'>
        Click the bar for more info.
      </Text>
    </div>
  </>
);
