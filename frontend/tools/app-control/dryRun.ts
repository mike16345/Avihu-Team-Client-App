import type { CommandSpec, CommandStep } from "./types";

const formatCommand = (step: CommandStep): string => [step.command, ...step.args].join(" ");

const formatEnvironment = (step: CommandStep): string =>
  `APP_TENANT=${step.env.APP_TENANT} APP_ENV=${step.env.APP_ENV}`;

const getSteps = (spec: CommandSpec): CommandStep[] =>
  spec.prerequisite ? [spec.prerequisite, spec] : [spec];

export const formatDryRun = (spec: CommandSpec): string => {
  const steps = getSteps(spec);
  return steps
    .map(
      (step, index) =>
        `Dry run ${index + 1}/${steps.length}: ${formatEnvironment(step)} ${formatCommand(step)}`
    )
    .join("\n");
};
