import { type ReactNode, useMemo, useCallback, useRef, useEffect } from "react";

import { type PopoverContentProps } from "@reactour/tour";
import clsx from "clsx";

import { logger } from "~/application/logger";
import { isUuid } from "~/lib/typeguards";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { ButtonFooter } from "~/components/structural/ButtonFooter";

const findBar = () =>
  // The first two <g/> elements are for the axis of the chart.
  document.querySelectorAll(".skills-bar-chart-view svg > g > g:nth-child(3) > rect")[0];

const findExpandButton = () =>
  document.querySelectorAll(
    [
      /* eslint-disable-next-line quotes */
      'div[data-attr-tour-id="recent-experience"]',
      /* eslint-disable-next-line quotes */
      'div[data-attr-tour-id="resume-model-tile"]:first-child',
      /* eslint-disable-next-line quotes */
      'button[data-attr-tour-id="expand-button"]',
    ].join(" "),
  )[0];

const getBarSkillId = (element: Element) => {
  const attr = element.getAttribute("aria-label");
  if (attr && attr.startsWith("skill-")) {
    const skillId = attr.split("skill-")[1];
    if (isUuid(skillId)) {
      return skillId;
    } else {
      logger.error(
        `The bar had a valid aria-label referencing a skill, but the ID, '${skillId}' was not ` +
          "a valid UUID!  It cannot be used for the tour.",
        { attribute: attr },
      );
    }
  } else if (attr) {
    logger.error(`The bar's aria-label, '${attr}', is invalid.  It cannot be used for the tour.`);
  } else {
    logger.error("The bar's aria-label is missing.  It cannot be used for the tour.");
  }
  return null;
};

export const TourPopoverContainer = ({
  steps,
  currentStep,
  setCurrentStep,
  setIsOpen,
  ...props
}: PopoverContentProps): JSX.Element => {
  const { open, ids } = useDrawers();
  const drawerObserver = useRef<MutationObserver | null>(null);

  const content = useMemo(() => {
    let ct: ReactNode | void;
    const c = steps[currentStep].content;
    if (typeof c === "function") {
      ct = c({ steps, currentStep, setCurrentStep, setIsOpen, ...props });
    } else {
      ct = c;
    }
    if (ct) {
      return ct;
    }
    return null;
  }, [steps, currentStep, setCurrentStep, setIsOpen, props]);

  useEffect(
    () => () => {
      drawerObserver.current?.disconnect();
    },
    [],
  );

  const waitForDrawer = useCallback(
    (step: number) => {
      drawerObserver.current = new MutationObserver(() => {
        const divElement = document.getElementsByClassName("drawer")[0];
        if (divElement) {
          drawerObserver.current?.disconnect();
          setCurrentStep(step + 1);
        }
      });

      const node = document.getElementsByClassName("layout__content")[0];
      if (node) {
        drawerObserver.current.observe(node, {
          subtree: true,
          childList: true,
        });
      } else {
        logger.error(
          "Could not find 'layout__content' element in DOM - the drawer cannot be observed and " +
            "the tour must be ended.",
        );
        setIsOpen(false);
      }
    },
    [setIsOpen, setCurrentStep],
  );

  const nextStep = useCallback(() => {
    if (currentStep === 1) {
      const ele = findExpandButton();
      if (typeof (ele as HTMLElement).click === "function") {
        (ele as HTMLElement).click();
        return waitForDrawer(currentStep);
      }
      logger.error(
        "The expand button could not be found or did not expose a click method - it cannot " +
          "be used for the tour.",
      );
      return setIsOpen(false);
    } else if (currentStep === 3) {
      const ele = findBar();
      if (ele) {
        /* We cannot manually trigger a click event on a <g> element in the chart, so we have to
           open the drawer based on parsing the Skill's ID that is associated with the <g>
           element. */
        const skillId = getBarSkillId(ele);
        if (!skillId) {
          return setIsOpen(false);
        }
        open(ids.VIEW_SKILL, { skillId });
        return waitForDrawer(currentStep);
      } else {
        /* This might happen if there are query parameters in the URL that cause the filtered data
           of the chart to be empty.  While this is an edge case, it is still possible. */
        logger.error(
          "The skills bar chart does not seem to have any data in it - it cannot be used for " +
            "the tour.",
        );
        return setIsOpen(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, ids, open, setIsOpen, setCurrentStep, waitForDrawer]);

  if (content) {
    return (
      <div
        className={clsx("tour__container flex flex-col gap-[12px]", {
          "pr-[10px]": steps[currentStep].position === "left",
          "pl-[10px]": steps[currentStep].position === "right",
          "pt-[10px]": steps[currentStep].position === "bottom",
          "pb-[10px]": steps[currentStep].position === "top",
        })}
      >
        <div className="tour__container__inner">
          {content}
          <ButtonFooter
            buttonSize="xsmall"
            orientation="full-width"
            submitText={currentStep === steps.length - 1 ? "Finish" : "Next"}
            submitButtonType="button"
            cancelText={currentStep !== steps.length - 1 ? "Close" : undefined}
            onCancel={currentStep !== steps.length - 1 ? () => setIsOpen(false) : undefined}
            onSubmit={() => {
              if (currentStep === steps.length - 1) {
                setIsOpen(false);
              } else {
                nextStep();
              }
            }}
          />
        </div>
      </div>
    );
  }
  return <></>;
};
