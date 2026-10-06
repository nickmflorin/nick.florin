import { Command } from 'clipanion';

import { browserStatus, launchBrowser } from '~/scripts/job-search/browser/launch';
import { SystemClock } from '~/scripts/job-search/session';

import { JsonCommand, type JsonResult } from '../json-command';

/**
 * Launches the job-search Chrome for the browser server to attach to.
 */
export class JobsBrowserLaunchCommand extends JsonCommand {
  public static override paths = [['jobs', 'browser', 'launch']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Launch the job-search Chrome, for the browser server to attach to.',
    details: `
      Opens the dedicated job-search profile as an ordinary Chrome window with the DevTools
      protocol on port 9222, which the \`job-search-browser\` server attaches to. Run it before the
      first browser action of a run; it returns at once when the browser is already running.
    `,
    examples: [['Launch the job-search browser', '$0 jobs browser launch']],
  });

  protected async run(): Promise<JsonResult> {
    return launchBrowser(SystemClock.sleep);
  }
}

/**
 * Reports whether the job-search Chrome is running for the browser server to attach to.
 */
export class JobsBrowserStatusCommand extends JsonCommand {
  public static override paths = [['jobs', 'browser', 'status']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Report whether the job-search Chrome is running and attachable.',
    examples: [['Check the job-search browser', '$0 jobs browser status']],
  });

  protected async run(): Promise<JsonResult> {
    return browserStatus();
  }
}
