"use client";
import { type BrandResume } from "~/prisma/model";

import { type ISidebarItem } from "~/components/layout";
import { useNavMenu } from "~/hooks";

import { SiteMenu } from "./SiteMenu";

export interface ClientSiteNavMenuProps {
  readonly nav: ISidebarItem[];
  readonly resume: BrandResume | null;
}

export const ClientSiteNavMenu = async ({ nav, resume }: ClientSiteNavMenuProps) => {
  const { close } = useNavMenu();
  return <SiteMenu resume={resume} nav={nav} onClose={() => close()} />;
};