"use client";
import type { ReactNode } from "react";

import { TourProvider as RootTourProvider } from "@reactour/tour";
import { useCookies } from "next-client-cookies";

import { logger } from "~/internal/logger";

import { SkillBadge } from "~/components/badges/SkillBadge";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { TourContent } from "~/components/tours/TourContent";
import { TourPopoverContainer } from "~/components/tours/TourPopoverContainer";
import { Text, Description } from "~/components/typography";

export interface TourProviderProps {
  readonly children: ReactNode;
}

export const TourProvider = ({ children }: TourProviderProps) => {
  const { close } = useDrawers();
  const cookies = useCookies();
  return (
    <RootTourProvider
      ContentComponent={TourPopoverContainer}
      steps={[
        {
          selector: "#site-dropdown-menu-resume-item",
          mutationObservables: [".header__right"],
          position: "left",
          content: (
            <TourContent label="Resume">
              You can find my resume here, after opening the site dropdown menu.
            </TourContent>
          ),
          actionAfter: () => {
            const button = document.getElementById("site-dropdown-menu-button");
            if (!button) {
              logger.error(
                "Could not find button with ID 'site-dropdown-menu-button' in DOM.  The site " +
                  "dropdown menu cannot be closed.",
              );
            } else {
              button.blur();
            }
          },
        },
        {
          selector: [
            /* eslint-disable-next-line quotes */
            'div[data-attr-tour-id="recent-experience"]',
            /* eslint-disable-next-line quotes */
            'div[data-attr-tour-id="resume-model-tile"]:first-child',
            /* eslint-disable-next-line quotes */
            'button[data-attr-tour-id="expand-button"]',
          ].join(" "),
          position: "bottom",
          content: (
            <TourContent label="Expand Button">
              <Description fontSize="xs">
                If you see an&nbsp;
                <Text component="span" fontWeight="medium" className="text-body">
                  Expand Button
                </Text>
                &nbsp;, clicking on it will reveal more information about the item in the side
                drawer.
              </Description>
            </TourContent>
          ),
        },
        {
          selector: ".drawer",
          position: "left",
          padding: { mask: 2 },
          content: (
            <TourContent label="Expand Button">
              Here is some additional context about the item that was expanded.
            </TourContent>
          ),
        },
        {
          selector: ".skills-bar-chart-view svg > g g:nth-child(3) > rect",
          position: "right",
          content: (
            <TourContent label="Skills">
              <Description fontSize="xs">
                <Text component="span" fontWeight="medium" className="text-body">
                  Any reference to a skill in the application can be clicked.
                </Text>
                &nbsp; This includes both elements of the chart (shown here) as well as badges
                throughout the application (&nbsp;
                <SkillBadge
                  skill={{ id: "fake-uid", label: "Python" }}
                  fontSize="xxxs"
                  className="leading-[14px]"
                />
                &nbsp;).
              </Description>
              <Description fontSize="xs">
                This will open a contextual drawer showing additional details related to that
                specific skill.
              </Description>
            </TourContent>
          ),
        },
        {
          selector: ".drawer",
          position: "left",
          padding: { mask: 2 },
          actionAfter: () => {
            close();
            cookies.set("nick.florin:suppress-tour", "true");
          },
          content: (
            <TourContent label="Skills">
              Here, you can see some additional information about the skill you clicked.
            </TourContent>
          ),
        },
      ]}
    >
      {children}
    </RootTourProvider>
  );
};

export default TourProvider;
