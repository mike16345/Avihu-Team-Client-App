import type { CommandSpec, CommandStep } from "./types";
import {
  renderDetailLines,
  renderHeader,
  renderStatusLine,
  supportsDecoratedOutput,
} from "../cli-ui/render";

const formatCommand = (step: CommandStep): string => [step.command, ...step.args].join(" ");

const formatEnvironment = (step: CommandStep): string =>
  `APP_TENANT=${step.env.APP_TENANT} APP_ENV=${step.env.APP_ENV}`;

const getSteps = (spec: CommandSpec): CommandStep[] =>
  spec.prerequisite ? [spec.prerequisite, spec] : [spec];

export const formatDryRun = (spec: CommandSpec, decorated = supportsDecoratedOutput()): string => {
  const steps = getSteps(spec);
  return [
    renderHeader("App control dry run", `${spec.env.APP_TENANT} · ${spec.env.APP_ENV}`, decorated),
    ...steps.flatMap((step) => [
      renderStatusLine("info", step.label, decorated),
      renderDetailLines([`${formatEnvironment(step)} ${formatCommand(step)}`]),
    ]),
    "│",
    `└  ${steps.length} ${steps.length === 1 ? "step" : "steps"} · no changes made`,
  ].join("\n");
};
