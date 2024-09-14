import { DateTimeText } from "~/components/typography/DateTimeText";

export type ReadOnlyDateTimeCellProps = {
  readonly date: Date;
};

export const ReadOnlyDateTimeCell = ({ date }: ReadOnlyDateTimeCellProps): JSX.Element => (
  <div className="flex flex-row items-center justify-center">
    <DateTimeText formatSeparately value={date} fontWeight="regular" />
  </div>
);

export default ReadOnlyDateTimeCell;
