import { join, extname, parse } from 'path';
import fs from 'fs-extra';
import * as t from '@babel/types';
import { dirname, getPluginName, getShorthandName, TypeScriptAnalyzer } from '@checkup/core';

function getDocsFile(docsFilePath: string) {
  if (fs.existsSync(docsFilePath)) {
    return fs.readFile(docsFilePath, 'utf-8');
  }

  return fs.readFile(join(dirname(import.meta), '..', 'templates', 'task-template.md'), 'utf-8');
}

function replaceContent(contents: string, replacement: string, tagName: string) {
  return contents.replace(
    new RegExp(`<!--${tagName}_START-->(.|[\r\n])*<!--${tagName}_END-->`),
    `<!--${tagName}_START-->\n${replacement}\n<!--${tagName}_END-->`
  );
}

function isProperty(node: t.AssignmentExpression, name: string) {
  return (
    node.left.type === 'MemberExpression' &&
    node.left.object.type === 'ThisExpression' &&
    (node.left.property as t.Identifier).name === name
  );
}

function getValue(node: t.AssignmentExpression) {
  return (node.right as t.StringLiteral).value;
}

export async function generate(baseDir: string = process.cwd()) {
  let pluginName = getShorthandName(getPluginName(baseDir));
  let docsDir = join(baseDir, 'docs', 'tasks');
  let tasksDir = join(baseDir, 'lib', 'tasks');

  fs.ensureDir(docsDir);

  let taskPaths = (await fs.readdir(join(baseDir, 'lib', 'tasks'))).filter(
    (file) => extname(file) === '.js'
  );

  for (let taskPath of taskPaths) {
    let taskSource = await fs.readFile(join(tasksDir, taskPath), 'utf-8');
    let taskName: string = '';
    let taskDescription: string = '';

    new TypeScriptAnalyzer(taskSource).analyze({
      AssignmentExpression({ node }) {
        if (isProperty(node, 'taskName')) {
          taskName = getValue(node);
        }

        if (isProperty(node, 'description')) {
          taskDescription = getValue(node);
        }
      },
    });

    let docsFilePath = join(docsDir, `${parse(taskPath).name}.md`);
    let docsFileContents = await getDocsFile(docsFilePath);

    [
      {
        tagName: 'TASK_NAME',
        replacement: `# ${pluginName}/${taskName}`,
      },
      {
        tagName: 'TASK_DESCRIPTION',
        replacement: taskDescription,
      },
      {
        tagName: 'RUN',
        replacement: `## To run this task

\`\`\`bash
checkup run --task ${pluginName}/${taskName}
\`\`\``,
      },
    ].forEach((replacer) => {
      docsFileContents = replaceContent(docsFileContents, replacer.replacement, replacer.tagName);
    });

    await fs.writeFile(docsFilePath, docsFileContents);
  }
}
