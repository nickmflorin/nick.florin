import { Builtins, Cli, type CommandClass } from 'clipanion';

import { ContentSyncCommand } from './commands/content-sync-command';
import {
  JobsAnswersAddCommand,
  JobsAnswersResolveCommand,
  JobsApplicationFilledCommand,
  JobsApplicationSubmittedCommand,
  JobsPacketBuildCommand,
} from './commands/jobs/jobs-apply-commands';
import {
  JobsApplyCheckCommand,
  JobsApplyDiscardCommand,
  JobsApplyPauseCommand,
  JobsApplyPlanCommand,
  JobsApplyStartCommand,
} from './commands/jobs/jobs-apply-flow-commands';
import { JobsBudgetTakeCommand } from './commands/jobs/jobs-budget-take-command';
import {
  JobsConfigShowCommand,
  JobsConfigStatusCommand,
  JobsConfigWriteCommand,
} from './commands/jobs/jobs-config-commands';
import { JobsPageScriptCommand } from './commands/jobs/jobs-page-script-command';
import {
  JobsPostingDescribeCommand,
  JobsPostingListCommand,
  JobsPostingShowCommand,
  JobsQueueShowCommand,
  JobsReviewCommand,
  JobsScoreRecordCommand,
} from './commands/jobs/jobs-posting-commands';
import { JobsProfileDigestCommand } from './commands/jobs/jobs-profile-digest-command';
import { JobsResumeApproveCommand } from './commands/jobs/jobs-resume-approve-command';
import { JobsRunFinishCommand, JobsRunStartCommand } from './commands/jobs/jobs-run-commands';
import { JobsSearchUrlCommand } from './commands/jobs/jobs-search-url-command';
import { JobsTriageCommand } from './commands/jobs/jobs-triage-command';

/**
 * Every command the CLI exposes.
 *
 * Registration is a single list rather than a directory scan so that the set of commands is
 * knowable by reading one file, and so that adding a command is a compile-time change rather than
 * a filesystem convention that fails silently when it is not followed.
 */
const Commands: readonly CommandClass[] = [
  ContentSyncCommand,
  JobsAnswersAddCommand,
  JobsAnswersResolveCommand,
  JobsApplicationFilledCommand,
  JobsApplicationSubmittedCommand,
  JobsApplyCheckCommand,
  JobsApplyDiscardCommand,
  JobsApplyPauseCommand,
  JobsApplyPlanCommand,
  JobsApplyStartCommand,
  JobsBudgetTakeCommand,
  JobsConfigShowCommand,
  JobsConfigStatusCommand,
  JobsConfigWriteCommand,
  JobsPacketBuildCommand,
  JobsPageScriptCommand,
  JobsPostingDescribeCommand,
  JobsPostingListCommand,
  JobsPostingShowCommand,
  JobsProfileDigestCommand,
  JobsQueueShowCommand,
  JobsResumeApproveCommand,
  JobsReviewCommand,
  JobsRunFinishCommand,
  JobsRunStartCommand,
  JobsScoreRecordCommand,
  JobsSearchUrlCommand,
  JobsTriageCommand,
];

export const buildCli = (): Cli => {
  const cli = new Cli({
    binaryLabel: 'nick.florin',
    binaryName: 'pnpm cli',
  });
  cli.register(Builtins.HelpCommand);
  cli.register(Builtins.VersionCommand);
  for (const command of Commands) {
    cli.register(command);
  }
  return cli;
};
