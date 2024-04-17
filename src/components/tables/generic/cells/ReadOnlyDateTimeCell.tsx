import { PartitionedDateTimeDisplay } from "~/components/typography/PartitionedDateTimeDisplay";

export type ReadOnlyDateTimeCellProps = {
  readonly date: Date;
};

export const ReadOnlyDateTimeCell = ({ date }: ReadOnlyDateTimeCellProps): JSX.Element => (
  <div className="flex flex-row items-center justify-center">
    <PartitionedDateTimeDisplay date={date} fontWeight="regular" />
  </div>
);

export default ReadOnlyDateTimeCell;
