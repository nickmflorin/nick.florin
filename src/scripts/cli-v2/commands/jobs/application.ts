import { Command, Option } from 'clipanion';

import { markFilled, markSubmitted } from '~/scripts/job-search/applying/applications';
import { resolveSessionContext } from '~/scripts/job-search/context';

import { JsonCommand, type JsonResult } from '../json-command';

/**
 * Records that a posting's application has been filled and awaits Nick's submission.
 */
export class JobsApplicationFilledCommand extends JsonCommand {
  public static override paths = [['jobs', 'application', 'filled']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "Record that a posting's application is filled and awaits Nick's submission.",
    details: `
      A form-filled application must have been verified with \`jobs apply check\`: every planned
      value seen in the form, and the approved resume seen attached. Pass \`--by-hand\` only for an
      application Nick filled himself from its answer packet.
    `,
    examples: [
      ['Record a filled application', '$0 jobs application filled 4012345678'],
      [
        'Record an application Nick filled by hand',
        '$0 jobs application filled 4012345679 --by-hand',
      ],
    ],
  });
  public byHand = Option.Boolean('--by-hand', false, {
    description: 'Nick filled the application himself, from its answer packet.',
  });
  public id = Option.String({ name: 'id', required: true });

  protected async run(): Promise<JsonResult> {
    const posting = await markFilled(await resolveSessionContext(), this.id, {
      byHand: this.byHand,
    });
    return { id: posting.id, status: posting.status };
  }
}

/**
 * Records that a filled application has been submitted, by Nick or by the agent.
 */
export class JobsApplicationSubmittedCommand extends JsonCommand {
  public static override paths = [['jobs', 'application', 'submitted']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Record that a filled application has been submitted.',
    details: `
      Without \`--by-agent\`, records Nick's word that he submitted it — never run it on the
      strength of a form having been filled. With \`--by-agent\`, records the agent's own
      submission, which is refused unless \`applying.submit\` is \`verified\` and the draft is
      verified, unblocked and not deferred. Discards the application's draft and staged resume.
    `,
    examples: [
      ['Record that Nick submitted', '$0 jobs application submitted 4012345678'],
      ["Record the agent's submission", '$0 jobs application submitted 4012345678 --by-agent'],
    ],
  });
  public byAgent = Option.Boolean('--by-agent', false, {
    description: 'The agent submitted the application, under the verified submit policy.',
  });
  public id = Option.String({ name: 'id', required: true });

  protected async run(): Promise<JsonResult> {
    const posting = await markSubmitted(await resolveSessionContext(), this.id, {
      by: this.byAgent ? 'agent' : 'nick',
    });
    return { id: posting.id, status: posting.status };
  }
}
