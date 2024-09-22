import { DateTimeText } from "~/components/typography/DateTimeText";

export type ReadOnlyDateTimeCellProps = {
  readonly date: Date;
};

export const ReadOnlyDateTimeCell = ({ date }: ReadOnlyDateTimeCellProps): JSX.Element => (
  <DateTimeText formatSeparately value={date} fontWeight="regular" />
);

export default ReadOnlyDateTimeCell;
