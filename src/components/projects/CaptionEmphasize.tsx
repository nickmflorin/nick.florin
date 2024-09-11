import { type ReactNode } from "react";

export const CaptionEmphasize = ({ children }: { children: ReactNode }): JSX.Element => (
  <span className="font-medium text-[#7f7f7f]">{children}</span>
);
