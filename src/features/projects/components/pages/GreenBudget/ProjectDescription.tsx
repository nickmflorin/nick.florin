import { InlineLink } from '~/components/buttons';
import { Description } from '~/components/typography';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';

export const ProjectDescription = () => (
  <DescriptionGroup>
    <Description>
      <Emphasize>GreenBudget</Emphasize> is a modern, web-based, multi-user budgeting platform built
      for the film production industry. It was created to fill a niche in that market, replacing the
      outdated, inflexible and largely manual tools that producers had been relying on.
    </Description>
    <Description>
      The application consists of an extensive{' '}
      <InlineLink element='a' href='https://react.dev/'>
        React
      </InlineLink>{' '}
      frontend backed by a REST API written in{' '}
      <InlineLink element='a' href='https://www.djangoproject.com/'>
        Django
      </InlineLink>{' '}
      and{' '}
      <InlineLink element='a' href='https://www.django-rest-framework.org/'>
        Django REST Framework
      </InlineLink>
      . When I stopped working on the project, we were in the middle of migrating the frontend to{' '}
      <InlineLink element='a' href='https://nextjs.org/'>
        NextJS
      </InlineLink>
      .
    </Description>
    <Description>
      The application&apos;s tables are built on several open-source tabling libraries, interwoven
      with a large amount of custom tabling mechanics written internally with the help of{' '}
      <InlineLink element='a' href='https://react-redux.js.org/'>
        React Redux
      </InlineLink>{' '}
      and{' '}
      <InlineLink element='a' href='https://redux-saga.js.org/'>
        Redux Sagas
      </InlineLink>
      .
    </Description>
    <Description>
      By the time I stopped working on the project, <Emphasize>GreenBudget</Emphasize> had a little
      over <i>two thousand paying subscribers</i> and had drawn interest from several enterprise
      clients looking to adopt the platform for their own use.
    </Description>
  </DescriptionGroup>
);
