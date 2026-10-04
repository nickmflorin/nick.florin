import { lookUpCredentials } from '~/scripts/job-search/browser/sign-in';

const Settings = {
  automatic: true,
  emailVariable: 'JOBS_LINKEDIN_EMAIL',
  passwordVariable: 'JOBS_LINKEDIN_PASSWORD',
};

describe('lookUpCredentials()', () => {
  it('refuses while automatic sign-in is off, whatever the environment holds', () => {
    expect(
      lookUpCredentials(
        { ...Settings, automatic: false },
        { JOBS_LINKEDIN_EMAIL: 'jane@example.com', JOBS_LINKEDIN_PASSWORD: 'placeholder' },
      ),
    ).toMatchObject({ status: 'refused' });
  });

  it('refuses when a variable the settings name is unset, for Nick to sign in by hand', () => {
    expect(lookUpCredentials(Settings, { JOBS_LINKEDIN_EMAIL: 'jane@example.com' })).toMatchObject({
      reason: expect.stringContaining('JOBS_LINKEDIN_PASSWORD'),
      status: 'refused',
    });
  });

  it('reads the credentials from the variables the settings name', () => {
    expect(
      lookUpCredentials(
        { ...Settings, emailVariable: 'MY_EMAIL', passwordVariable: 'MY_PASSWORD' },
        { MY_EMAIL: ' jane@example.com ', MY_PASSWORD: 'placeholder' },
      ),
    ).toStrictEqual({
      credentials: { email: 'jane@example.com', password: 'placeholder' },
      status: 'found',
    });
  });
});
