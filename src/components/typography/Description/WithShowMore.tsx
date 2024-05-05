import { ResumeShowMoreLink } from "~/components/buttons/resume";
import { type TypographyVisibilityState } from "~/components/types/typography";

export const WithShowMore = ({
  includeShowMoreLink = false,
  state,
  children,
  isTruncated,
  onToggle,
}: {
  includeShowMoreLink?: boolean;
  state: TypographyVisibilityState;
  children: JSX.Element;
  isTruncated: boolean;
  onToggle: () => void;
}) =>
  includeShowMoreLink && isTruncated ? (
    <div className="flex flex-col gap-[2px]">
      {children}
      <ResumeShowMoreLink state={state} onClick={onToggle} />
    </div>
  ) : (
    children
  );
