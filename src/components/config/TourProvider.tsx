'use client';
import { type ReactNode } from 'react';

import { TourProvider as RootTourProvider } from '@reactour/tour';
import { useCookies } from 'next-client-cookies';

import { logger } from '~/internal/logger';

import { useDrawers } from '~/components/drawers/hooks/use-drawers';
import { TourContent } from '~/components/tours/TourContent';
import { TourPopoverContainer } from '~/components/tours/TourPopoverContainer';
import { Description, Text } from '~/components/typography';
import { SkillBadge } from '~/features/skills/components/badges';

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
          actionAfter: () => {
            const button = document.getElementById('site-dropdown-menu-button');
            if (button) {
              button.blur();
            } else {
              logger.error(
                "Could not find button with ID 'site-dropdown-menu-button' in DOM.  The site " +
                  'dropdown menu cannot be closed.',
              );
            }
          },
          content: (
            <TourContent label='Resume'>
              You can find my resume here, after opening the site dropdown menu.
            </TourContent>
          ),
          mutationObservables: ['.header__right'],
          position: 'left',
          selector: '#site-dropdown-menu-resume-item',
        },
        {
          content: (
            <TourContent label='Expand Button'>
              <Description fontSize='xs'>
                If you see an&nbsp;
                <Text className='text-body' component='span' fontWeight='medium'>
                  Expand Button
                </Text>
                &nbsp;, clicking on it will reveal more information about the item in the side
                drawer.
              </Description>
            </TourContent>
          ),
          position: 'bottom',
          selector: [
            'div[data-attr-tour-id="recent-experience"]',
            'div[data-attr-tour-id="resume-model-tile"]:first-child',
            'button[data-attr-tour-id="expand-button"]',
          ].join(' '),
        },
        {
          content: (
            <TourContent label='Expand Button'>
              Here is some additional context about the item that was expanded.
            </TourContent>
          ),
          padding: { mask: 2 },
          position: 'left',
          selector: '.drawer',
        },
        {
          content: (
            <TourContent label='Skills'>
              <Description fontSize='xs'>
                <Text className='text-body' component='span' fontWeight='medium'>
                  Any reference to a skill in the application can be clicked.
                </Text>
                &nbsp; This includes both elements of the chart (shown here) as well as badges
                throughout the application (&nbsp;
                <SkillBadge
                  className='leading-[14px]'
                  fontSize='xxxs'
                  skill={{ id: 'fake-uid', label: 'Python' }}
                />
                &nbsp;).
              </Description>
              <Description fontSize='xs'>
                This will open a contextual drawer showing additional details related to that
                specific skill.
              </Description>
            </TourContent>
          ),
          position: 'right',
          selector: '.skills-bar-chart-view svg > g g:nth-child(3) > rect',
        },
        {
          actionAfter: () => {
            close();
            cookies.set('nick.florin:suppress-tour', 'true');
          },
          content: (
            <TourContent label='Skills'>
              Here, you can see some additional information about the skill you clicked.
            </TourContent>
          ),
          padding: { mask: 2 },
          position: 'left',
          selector: '.drawer',
        },
      ]}
    >
      {children}
    </RootTourProvider>
  );
};
