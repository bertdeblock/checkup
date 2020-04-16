import { ReporterType, TaskResult, ui } from '@checkup/core';

import { generateReport } from './helpers/pdf';

export function _transformResults(
  metaTaskResults: TaskResult[],
  pluginTaskResults: TaskResult[],
  reporterType: ReporterType
) {
  let transformedResult = {
    meta: Object.assign({}, ...metaTaskResults.map((result) => result[reporterType]())),
    results: pluginTaskResults.map((result) => result[reporterType]()),
  };

  return transformedResult;
}

export function getReporter(
  flags: any,
  metaTaskResults: TaskResult[],
  pluginTaskResults: TaskResult[]
) {
  switch (flags.reporter) {
    case ReporterType.stdout:
      return async () => {
        if (!flags.silent) {
          metaTaskResults.forEach((taskResult) => taskResult.stdout());
          pluginTaskResults.forEach((taskResult) => taskResult.stdout());
        }
      };
    case ReporterType.json:
      return async () => {
        let resultJson = _transformResults(metaTaskResults, pluginTaskResults, ReporterType.json);
        ui.styledJSON(resultJson);
      };
    case ReporterType.pdf:
      return async () => {
        let resultsForPdf = _transformResults(metaTaskResults, pluginTaskResults, ReporterType.pdf);
        let reportPath = await generateReport(flags.reportOutputPath, resultsForPdf);

        ui.log(reportPath);
      };
    default:
      return async () => {};
  }
}
