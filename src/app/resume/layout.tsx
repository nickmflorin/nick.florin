import { classNames } from "~/components/types";

interface ResumeLayoutProps {
  readonly children: React.ReactNode;
}

export default async function ResumeLayout({ children }: ResumeLayoutProps) {
  return (
    <div
      className={classNames(
        "flex flex-col grow relative max-h-full min-h-full",
        "overflow-y-auto w-full pr-[16px]",
      )}
    >
      <div
        className={classNames(
          "flex flex-col max-h-full my-0",
          "sm:w-full sm:max-w-full sm:mx-auto",
          "md:min-w-[680px] md:max-w-[820px]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
