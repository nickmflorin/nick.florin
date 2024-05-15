import clsx from "clsx";

interface ResumeLayoutProps {
  readonly children: React.ReactNode;
}

export default async function ResumeLayout({ children }: ResumeLayoutProps) {
  return (
    <div className="flex flex-col grow relative max-h-full min-h-full overflow-y-auto w-full">
      <div
        className={clsx(
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
