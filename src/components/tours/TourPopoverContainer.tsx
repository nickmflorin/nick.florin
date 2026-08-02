import { type JSX, type ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';

import { type PopoverContentProps } from '@reactour/tour';

import { logger } from '~/internal/logger';
import { isUuid } from '~/lib/typeguards';

import { useDrawers } from '~/components/drawers/hooks/use-drawers';
import { ButtonFooter } from '~/components/structural/ButtonFooter';
import { classNames } from '~/components/types';

/**
 * Finds the DOM element for the bar in the skills bar chart.
 *
 * The first two `<g>` elements in the chart's SVG are for the axis, so the target bar is the third
 * `g` child.
 */
const findBar = (): Element | undefined =>
  document.querySelectorAll('.skills-bar-chart-view svg > g > g:nth-child(3) > rect')[0];

const findExpandButton = () =>
  document.querySelectorAll(
    [
      'div[data-attr-tour-id="recent-experience"]',
      'div[data-attr-tour-id="resume-model-tile"]:first-child',
      'button[data-attr-tour-id="expand-button"]',
    ].join(' '),
  )[0];

const getBarSkillId = (element: Element) => {
  const attr = element.getAttribute('aria-label');
  if (attr?.startsWith('skill-')) {
    const skillId = attr.split('skill-')[1];
    if (isUuid(skillId)) {
      return skillId;
    }
    logger.error(
      'The bar had a valid aria-label referencing a skill, but the ID that it contains was ' +
        'not a valid UUID!  It cannot be used for the tour.',
      { attribute: attr },
    );
  } else if (attr) {
    logger.error(`The bar's aria-label, '${attr}', is invalid.  It cannot be used for the tour.`);
  } else {
    logger.error("The bar's aria-label is missing.  It cannot be used for the tour.");
  }
  return null;
};

export const TourPopoverContainer = ({
  currentStep,
  setCurrentStep,
  setIsOpen,
  steps,
  ...props
}: PopoverContentProps): JSX.Element | null => {
  const { ids, open } = useDrawers();
  const drawerObserver = useRef<MutationObserver | null>(null);

  const content = useMemo(() => {
    let ct: ReactNode | void;
    const c = steps[currentStep].content;
    if (typeof c === 'function') {
      ct = c({ currentStep, setCurrentStep, setIsOpen, steps, ...props });
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
        const divElement = document.getElementsByClassName('drawer').item(0);
        if (divElement) {
          drawerObserver.current?.disconnect();
          setCurrentStep(step + 1);
        }
      });

      const node = document.getElementsByClassName('layout__content').item(0);
      if (node) {
        drawerObserver.current.observe(node, {
          childList: true,
          subtree: true,
        });
      } else {
        logger.error(
          "Could not find 'layout__content' element in DOM - the drawer cannot be observed and " +
            'the tour must be ended.',
        );
        setIsOpen(false);
      }
    },
    [setIsOpen, setCurrentStep],
  );

  const nextStep = useCallback(() => {
    if (currentStep === 1) {
      const ele = findExpandButton();
      if (typeof (ele as HTMLElement).click === 'function') {
        (ele as HTMLElement).click();
        return waitForDrawer(currentStep);
      }
      logger.error(
        'The expand button could not be found or did not expose a click method - it cannot ' +
          'be used for the tour.',
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
      }
      /* This might happen if there are query parameters in the URL that cause the filtered data
           of the chart to be empty.  While this is an edge case, it is still possible. */
      logger.error(
        'The skills bar chart does not seem to have any data in it - it cannot be used for ' +
          'the tour.',
      );
      return setIsOpen(false);
    }
    setCurrentStep(currentStep + 1);
  }, [currentStep, ids, open, setIsOpen, setCurrentStep, waitForDrawer]);

  if (content) {
    return (
      <div
        className={classNames('tour__container flex flex-col gap-[12px]', {
          'pb-[10px]': steps[currentStep].position === 'top',
          'pl-[10px]': steps[currentStep].position === 'right',
          'pr-[10px]': steps[currentStep].position === 'left',
          'pt-[10px]': steps[currentStep].position === 'bottom',
        })}
      >
        <div className='tour__container__inner'>
          {content}
          <ButtonFooter
            buttonSize='xsmall'
            cancelText={currentStep === steps.length - 1 ? undefined : 'Close'}
            onCancel={currentStep === steps.length - 1 ? undefined : () => setIsOpen(false)}
            onSubmit={() => {
              if (currentStep === steps.length - 1) {
                setIsOpen(false);
              } else {
                nextStep();
              }
            }}
            orientation='full-width'
            submitButtonType='button'
            submitText={currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          />
        </div>
      </div>
    );
  }
  return null;
};
