import { DateTimeText } from "~/components/typography/DateTimeText";
import { HorizontallyCentered } from "~/components/util";

export type ReadOnlyDateTimeCellProps = {
  readonly date: Date;
};

export const ReadOnlyDateTimeCell = ({ date }: ReadOnlyDateTimeCellProps): JSX.Element => (
  <HorizontallyCentered>
    <DateTimeText formatSeparately value={date} fontWeight="regular" />
  </HorizontallyCentered>
);

export default ReadOnlyDateTimeCell;
