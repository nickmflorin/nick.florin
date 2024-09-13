import { Content } from "~/components/layout/Content";
import { classNames } from "~/components/types";

interface ResumeLayoutProps {
  readonly children: React.ReactNode;
}

export default async function ResumeLayout({ children }: ResumeLayoutProps) {
  return (
    <Content
      scrollable
      className="flex flex-col grow relative max-h-full min-h-full w-full max-sm:pt-[16px]"
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
    </Content>
  );
}
