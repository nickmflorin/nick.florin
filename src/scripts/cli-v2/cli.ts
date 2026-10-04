import { Builtins, Cli, type CommandClass } from 'clipanion';

import { ContentSyncCommand } from './commands/content-sync-command';
import {
  JobsAnswersAddCommand,
  JobsAnswersResolveCommand,
  JobsApplicationFilledCommand,
  JobsApplicationSubmittedCommand,
  JobsApplyCheckCommand,
  JobsApplyDeferCommand,
  JobsApplyDiscardCommand,
  JobsApplyHeldCommand,
  JobsApplyPauseCommand,
  JobsApplyPlanCommand,
  JobsApplyStartCommand,
  JobsBrowserLaunchCommand,
  JobsBrowserStatusCommand,
  JobsBudgetTakeCommand,
  JobsConfigShowCommand,
  JobsConfigStatusCommand,
  JobsConfigWriteCommand,
  JobsCoverLetterApproveCommand,
  JobsCoverLetterContextCommand,
  JobsCoverLetterSaveCommand,
  JobsCoverLetterShowCommand,
  JobsLearningReportCommand,
  JobsLinkedInSignInCommand,
  JobsPacketBuildCommand,
  JobsPageScriptCommand,
  JobsPoolNextCommand,
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
} from './commands/jobs';
import { ResumeGenerateCommand } from './commands/resume';

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
  JobsApplyDeferCommand,
  JobsApplyDiscardCommand,
  JobsApplyHeldCommand,
  JobsApplyPauseCommand,
  JobsApplyPlanCommand,
  JobsApplyStartCommand,
  JobsBrowserLaunchCommand,
  JobsBrowserStatusCommand,
  JobsBudgetTakeCommand,
  JobsConfigShowCommand,
  JobsConfigStatusCommand,
  JobsConfigWriteCommand,
  JobsCoverLetterApproveCommand,
  JobsCoverLetterContextCommand,
  JobsCoverLetterSaveCommand,
  JobsCoverLetterShowCommand,
  JobsLearningReportCommand,
  JobsLinkedInSignInCommand,
  JobsPacketBuildCommand,
  JobsPageScriptCommand,
  JobsPoolNextCommand,
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
  ResumeGenerateCommand,
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
