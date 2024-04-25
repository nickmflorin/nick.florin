import { Label } from "~/components/typography/Label";

interface DetailDrawerSectionProps {
  readonly label: string;
  readonly children: JSX.Element | JSX.Element[];
}

export const DetailDrawerSection = ({ label, children }: DetailDrawerSectionProps) =>
  Array.isArray(children) && children.length === 0 ? (
    <></>
  ) : (
    <div className="flex flex-col gap-[8px] pr-[12px]">
      <hr className="w-full border-t border-gray-200" />
      <div className="flex flex-col gap-[12px]">
        <Label fontSize="sm" fontWeight="medium">
          {label}
        </Label>
        {Array.isArray(children) ? (
          <div className="flex flex-col gap-[12px]">{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
