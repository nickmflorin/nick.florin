import { Description, Label, Text } from '~/components/typography';

interface SeriesItemProps {
  readonly children: string;
  readonly title: string;
}

export const SeriesItem = ({ children, title }: SeriesItemProps) => (
  <div className='flex flex-row max-md:flex-col items-start gap-[6px]'>
    <Label className='md:max-w-[70px] md:min-w-[70px] text-sm max-sm:text-xs' fontWeight='medium'>
      {title}
      <Text className='max-md:hidden' component='span'>
        :
      </Text>
    </Label>
    <Description>{children}</Description>
  </div>
);
