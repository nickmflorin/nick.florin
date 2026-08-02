import { InlineLink } from '~/components/buttons';
import { Description } from '~/components/typography';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Emphasize } from '~/features/projects/components/Emphasize';

export const ProjectDescription = () => (
  <DescriptionGroup>
    <Description>
      <Emphasize>GreenBudget</Emphasize> is an application that was created to address a niche
      market opportunity by providing a modern, web-based, multi-user collaborative budgeting
      solution for the film production industry. It replaced many outdated, inflexible and somewhat
      manual solutions that previously existed in the market.
    </Description>
    <Description>
      The application consists of an extensive&nbsp;
      <InlineLink element='a' href='https://react.dev/'>
        React
      </InlineLink>
      &nbsp;frontend powered by a robust, REST API written using&nbsp;
      <InlineLink element='a' href='https://www.djangoproject.com/'>
        Django
      </InlineLink>
      &nbsp;and&nbsp;
      <InlineLink element='a' href='https://www.django-rest-framework.org/'>
        Django REST Framework
      </InlineLink>
      &nbsp;. At the time in which I stopped working on the project, we were in the midst of
      transitioning the frontend to the popular&nbsp;
      <InlineLink element='a' href='https://nextjs.org/'>
        NextJS
      </InlineLink>
      &nbsp;framework.
    </Description>
    <Description>
      The application relies on several different open-source tabling libraries interwoven with a
      large amount of internal, custom built tabling mechanics that are built primarily with the
      help of technology such as &nbsp;
      <InlineLink element='a' href='https://react-redux.js.org/'>
        React Redux
      </InlineLink>
      &nbsp;and&nbsp;
      <InlineLink element='a' href='https://redux-saga.js.org/'>
        Redux Sagas
      </InlineLink>
      .
    </Description>
    <Description>
      By the time I stopped working on the project,&nbsp;
      <Emphasize>GreenBudget</Emphasize>&nbsp;boasted a little over&nbsp;
      <i>2 thousand subscribed (paying) users</i>&nbsp;and had drawn interest from a number of
      enterprise clients who had expressed interest in adopting the platform for their own use.
    </Description>
  </DescriptionGroup>
);
