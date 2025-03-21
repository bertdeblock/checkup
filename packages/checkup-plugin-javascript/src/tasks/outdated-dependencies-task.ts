import { join } from 'path';
import { Result } from 'sarif';
import { BaseTask, Task, DependencyAnalyzer, TaskContext } from '@checkup/core';

export default class OutdatedDependenciesTask extends BaseTask implements Task {
  taskName = 'outdated-dependencies';
  taskDisplayName = 'Outdated Dependencies';
  description = 'Gets a summary of all outdated dependencies in a project';
  category = 'dependencies';

  constructor(pluginName: string, context: TaskContext) {
    super(pluginName, context);

    this.addRule({
      properties: {
        component: {
          name: 'table',
          options: {
            rows: {
              Dependency: 'properties.packageName',
              Installed: 'properties.packageVersion',
              Latest: 'properties.latestVersion',
            },
          },
        },
      },
    });
  }

  async run(): Promise<Result[]> {
    let analyzer = new DependencyAnalyzer(this.context.options.cwd);
    let dependencies = await analyzer.analyze();

    dependencies
      .filter((dependency) => {
        return ['major', 'minor', 'patch'].includes(dependency.semverBump);
      })
      .forEach((dependency) => {
        this.addResult(
          `Outdated ${dependency.semverBump} version of ${dependency.packageName}. Installed: ${dependency.installedVersion}. Latest: ${dependency.latestVersion}.`,
          'review',
          getLevel(dependency.semverBump),
          {
            location: {
              uri: join(this.context.options.cwd, 'package.json'),
              startColumn: dependency.startColumn,
              startLine: dependency.startLine,
              endColumn: dependency.endColumn,
              endLine: dependency.endLine,
            },
            properties: {
              packageName: dependency.packageName,
              packageVersion: dependency.packageVersion,
              latestVersion: dependency.latestVersion,
              type: dependency.type,
            },
          }
        );
      });

    return this.results;
  }
}

function getLevel(semverBump: string): Result.level {
  switch (semverBump) {
    case 'major': {
      return 'error';
    }
    case 'minor': {
      return 'warning';
    }
    case 'patch': {
      return 'note';
    }
    default: {
      return 'none';
    }
  }
}
