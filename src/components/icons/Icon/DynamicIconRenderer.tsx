"use client";
import { useState, useEffect } from "react";

import {
  type DynamicIconProp,
  type BasicIconProps,
  type DynamicIcon,
  type IconProps,
} from "../types";

import { Icon } from ".";

export interface DynamicIconRendererProps extends BasicIconProps<DynamicIconProp> {}

export const DynamicIconRenderer = ({
  icon,
  iconStyle,
  family,
  ...props
}: DynamicIconRendererProps) => {
  const [icons, setIcons] = useState<DynamicIcon[] | null>(null);

  useEffect(() => {
    const setVisible = async (ics: DynamicIcon[]) => {
      let visibleEncountered = false;

      let modified: DynamicIcon[] = [];
      for (const i of ics) {
        if (i.visible) {
          if (visibleEncountered) {
            const logger = (await import("~/application/logger")).logger;
            logger.error(
              { icons: ics, icon: i },
              "The dynamically provided set of icons includes multiple visible icons. " +
                "Only the first will be rendered.",
            );
            modified = [...modified, { icon: i.icon, visible: false }];
          } else {
            modified = [...modified, i];
            visibleEncountered = true;
          }
        } else {
          modified = [...modified, i];
        }
      }
      if (!visibleEncountered) {
        const logger = (await import("~/application/logger")).logger;
        logger.error(
          { icons: ics },
          "The dynamically provided set of icons does not include a visible icon. " +
            "No icon will be rendered.",
        );
        return setIcons(null);
      }
      return setIcons(modified);
    };
    setVisible(icon);
  }, [icon]);

  /* This also accounts for the case where the icon array is empty - because of the
     'visibleEncountered' check in the effect. */
  if (!icons) {
    return <></>;
  }
  return (
    <>
      {icons.map((i, index) => {
        // Omit the hidden flag - it is encompassed in the isVisible flag.
        const ps = {
          ...props,
          iconStyle,
          family,
          icon: i.icon,
        } as IconProps;
        // There should only be one visible icon at a time, due to the checks in the effect.
        return <Icon {...ps} visible={i.visible} key={index} />;
      })}
    </>
  );
};

export default DynamicIconRenderer;
