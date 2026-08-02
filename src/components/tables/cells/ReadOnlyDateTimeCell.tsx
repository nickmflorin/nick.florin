import { type JSX } from 'react';

import { DateTimeText } from '~/components/typography/DateTimeText';

export type ReadOnlyDateTimeCellProps = {
  readonly date: Date;
};

export const ReadOnlyDateTimeCell = ({ date }: ReadOnlyDateTimeCellProps): JSX.Element => (
  <DateTimeText component='text' fontWeight='regular' formatSeparately value={date} />
);
