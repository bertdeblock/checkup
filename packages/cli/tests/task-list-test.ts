import { getTaskContext } from '@checkup/test-helpers';
import { BaseTask, Task, TaskContext } from '@checkup/core';

import { Result } from 'sarif';
import TaskList from '../src/task-list';
const STABLE_ERROR = new Error('Something went wrong in this task');

class InsightsTaskHigh extends BaseTask implements Task {
  taskName = 'insights-task-high';
  taskDisplayName = 'Insights Task High';
  description = 'description';
  category = 'bar';
  group = 'group1';

  constructor(context: TaskContext) {
    super('fake', context);
  }

  async run(): Promise<Result[]> {
    return [
      {
        message: { text: 'hi' },
        properties: {
          taskDisplayName: this.taskDisplayName,
          category: this.category,
          group: this.group,
        },
        ruleId: this.taskName,
      },
    ];
  }
}

class InsightsTaskLow extends BaseTask implements Task {
  taskName = 'insights-task-low';
  taskDisplayName = 'Insights Task Low';
  description = 'description';
  category = 'foo';
  group = 'group2';

  constructor(context: TaskContext) {
    super('fake', context);
  }
  async run(): Promise<Result[]> {
    return [
      {
        message: { text: 'hi' },
        properties: {
          taskDisplayName: this.taskDisplayName,
          category: this.category,
          group: this.group,
        },
        ruleId: this.taskName,
      },
    ];
  }
}

class RecommendationsTaskHigh extends BaseTask implements Task {
  taskName = 'recommendations-task-high';
  taskDisplayName = 'Recommendations Task High';
  description = 'description';
  category = 'baz';

  constructor(context: TaskContext) {
    super('fake', context);
  }
  async run(): Promise<Result[]> {
    return [
      {
        message: { text: 'hi' },
        properties: {
          taskDisplayName: this.taskDisplayName,
          category: this.category,
          group: this.group,
        },
        ruleId: this.taskName,
      },
    ];
  }
}

class RecommendationsTaskLow extends BaseTask implements Task {
  taskName = 'recommendations-task-low';
  taskDisplayName = 'Recommendations Task Low';
  description = 'description';
  category = 'bar';

  constructor(context: TaskContext) {
    super('fake', context);
  }
  async run(): Promise<Result[]> {
    return [
      {
        message: { text: 'hi' },
        properties: {
          taskDisplayName: this.taskDisplayName,
          category: this.category,
          group: this.group,
        },
        ruleId: this.taskName,
      },
    ];
  }
}

class MigrationTaskHigh extends BaseTask implements Task {
  taskName = 'migration-task-high';
  taskDisplayName = 'Migration Task High';
  description = 'description';
  category = 'foo';

  constructor(context: TaskContext) {
    super('fake', context);
  }
  async run(): Promise<Result[]> {
    return [
      {
        message: { text: 'hi' },
        properties: {
          taskDisplayName: this.taskDisplayName,
          category: this.category,
          group: this.group,
        },
        ruleId: this.taskName,
      },
    ];
  }
}

class MigrationTaskLow extends BaseTask implements Task {
  taskName = 'migration-task-low';
  taskDisplayName = 'Migration Task Low';
  description = 'description';
  category = 'baz';

  constructor(context: TaskContext) {
    super('fake', context);
  }
  async run(): Promise<Result[]> {
    return [
      {
        message: { text: 'hi' },
        properties: {
          taskDisplayName: this.taskDisplayName,
          category: this.category,
          group: this.group,
        },
        ruleId: this.taskName,
      },
    ];
  }
}

class FatalErrorTask extends BaseTask implements Task {
  taskName = 'error-task';
  taskDisplayName = 'Error Task';
  description = 'description';
  category = 'bar';

  constructor(context: TaskContext) {
    super('fake', context);
  }
  async run(): Promise<Result[]> {
    throw STABLE_ERROR;
  }
}

class NonFatalErrorTask extends BaseTask implements Task {
  taskName = 'non-fatal-error-task';
  taskDisplayName = 'Non-Fatal Error Task';
  description = 'description';
  category = 'bar';

  constructor(context: TaskContext) {
    super('fake', context);
  }
  async run(): Promise<Result[]> {
    this.addNonFatalError(STABLE_ERROR);
    return [];
  }
}

class TaskWithoutCategory extends BaseTask implements Task {
  taskName = 'task-without-category';
  taskDisplayName = 'Task Without Category';
  description = 'description';
  category = '';

  constructor(context: TaskContext) {
    super('fake', context);
  }

  async run(): Promise<Result[]> {
    return [
      {
        message: { text: 'hi' },
        properties: {
          taskDisplayName: this.taskDisplayName,
          group: this.group,
        },
        ruleId: this.taskName,
      },
    ];
  }
}

describe('TaskList', () => {
  it('can create an instance of a TaskList', () => {
    let taskList = new TaskList();

    expect(taskList).toBeInstanceOf(TaskList);
    expect(taskList.categories.size).toEqual(0);
  });

  it('registerTask adds a task to the TaskList', () => {
    let taskList = new TaskList();

    taskList.registerTask(new InsightsTaskHigh(getTaskContext()));

    expect(taskList.categories.get('bar')!.size).toEqual(1);
  });

  it("registerTask fails if a task doesn't have a category set", () => {
    let taskList = new TaskList();
    let taskWithoutCategory = new TaskWithoutCategory(getTaskContext());

    expect(() => {
      taskList.registerTask(taskWithoutCategory);
    }).toThrow(`Task category cannot be empty.`);
  });

  it('hasTask returns false if no task exists with that name', () => {
    let taskList = new TaskList();

    taskList.registerTask(new InsightsTaskHigh(getTaskContext()));

    expect(taskList.hasTask('foo')).toEqual(false);
  });

  it('hasTask returns true if task exists with that name', () => {
    let taskList = new TaskList();

    taskList.registerTask(new InsightsTaskHigh(getTaskContext()));

    expect(taskList.hasTask('insights-task-high')).toEqual(true);
  });

  it('findTask returns undefined if no task exists with that name', () => {
    let taskList = new TaskList();

    taskList.registerTask(new InsightsTaskHigh(getTaskContext()));

    expect(taskList.findTask('foo')).toBeUndefined();
  });

  it('findTask returns task instance if task exists with that name', () => {
    let taskList = new TaskList();

    taskList.registerTask(new InsightsTaskHigh(getTaskContext()));

    expect(taskList.findTask('insights-task-high')).toBeDefined();
  });

  it('findAllByTaskName returns task instances if tasks exists with that name', () => {
    let taskList = new TaskList();

    taskList.registerTask(new InsightsTaskHigh(getTaskContext()));
    taskList.registerTask(new InsightsTaskLow(getTaskContext()));

    expect(
      taskList.findAllByTaskName('fake/insights-task-high', 'fake/insights-task-low').tasksFound
    ).toHaveLength(2);
  });

  it('findAllByTaskName returns task instances that exist, as well as names of tasks not found', () => {
    let taskList = new TaskList();

    taskList.registerTask(new InsightsTaskHigh(getTaskContext()));
    let tasks = taskList.findAllByTaskName('fake/insights-task-high', 'fake/random');
    expect(tasks.tasksFound).toHaveLength(1);
    expect(tasks.tasksNotFound).toContain('fake/random');
  });

  it('runTask will run a task by taskName', async () => {
    let taskList = new TaskList();

    taskList.registerTask(new InsightsTaskHigh(getTaskContext()));

    let [result, errors] = await taskList.runTask('insights-task-high');

    expect(result).toMatchInlineSnapshot(`
[
  {
    "message": {
      "text": "hi",
    },
    "properties": {
      "category": "bar",
      "group": "group1",
      "taskDisplayName": "Insights Task High",
    },
    "ruleId": "insights-task-high",
  },
]
`);
    expect(errors).toHaveLength(0);
  });

  it('findAllByCategory returns task instances if tasks exists by category', () => {
    let taskList = new TaskList();

    taskList.registerTask(new InsightsTaskHigh(getTaskContext()));
    taskList.registerTask(new InsightsTaskLow(getTaskContext()));

    expect(taskList.findAllByCategory('foo', 'bar').tasksFound).toHaveLength(2);
  });

  it('findAllByCategory returns task instances that exist, as well as names of tasks not found', () => {
    let taskList = new TaskList();

    taskList.registerTask(new InsightsTaskLow(getTaskContext()));
    let tasks = taskList.findAllByCategory('foo', 'bar');
    expect(tasks.tasksFound).toHaveLength(1);
    expect(tasks.tasksNotFound).toContain('bar');
  });

  it('findAllByGroup returns task instances if tasks exists by group', () => {
    let taskList = new TaskList();

    taskList.registerTask(new InsightsTaskHigh(getTaskContext()));
    taskList.registerTask(new InsightsTaskLow(getTaskContext()));

    expect(taskList.findAllByGroup('group1', 'group2').tasksFound).toHaveLength(2);
  });

  it('findAllByGroup returns task instances that exist, as well as names of tasks not found', () => {
    let taskList = new TaskList();

    taskList.registerTask(new InsightsTaskLow(getTaskContext()));
    let tasks = taskList.findAllByGroup('group1', 'group2');
    expect(tasks.tasksFound).toHaveLength(1);
    expect(tasks.tasksNotFound).toContain('group1');
  });

  it('runTasks will run all registered tasks', async () => {
    let taskList = new TaskList();

    taskList.registerTask(new InsightsTaskHigh(getTaskContext()));
    taskList.registerTask(new InsightsTaskLow(getTaskContext()));

    let [results, errors] = await taskList.runTasks();

    expect(results).toMatchInlineSnapshot(`
[
  {
    "message": {
      "text": "hi",
    },
    "properties": {
      "category": "foo",
      "group": "group2",
      "taskDisplayName": "Insights Task Low",
    },
    "ruleId": "insights-task-low",
  },
  {
    "message": {
      "text": "hi",
    },
    "properties": {
      "category": "bar",
      "group": "group1",
      "taskDisplayName": "Insights Task High",
    },
    "ruleId": "insights-task-high",
  },
]
`);
    expect(errors).toHaveLength(0);
  });

  it('runTasks will sort tasks in the correct order', async () => {
    let taskList = new TaskList();

    taskList.registerTask(new InsightsTaskLow(getTaskContext()));
    taskList.registerTask(new RecommendationsTaskHigh(getTaskContext()));
    taskList.registerTask(new MigrationTaskLow(getTaskContext()));
    taskList.registerTask(new MigrationTaskHigh(getTaskContext()));
    taskList.registerTask(new RecommendationsTaskLow(getTaskContext()));
    taskList.registerTask(new InsightsTaskHigh(getTaskContext()));

    let [results, errors] = await taskList.runTasks();

    expect(results).toMatchInlineSnapshot(`
[
  {
    "message": {
      "text": "hi",
    },
    "properties": {
      "category": "foo",
      "group": "group2",
      "taskDisplayName": "Insights Task Low",
    },
    "ruleId": "insights-task-low",
  },
  {
    "message": {
      "text": "hi",
    },
    "properties": {
      "category": "bar",
      "group": "group1",
      "taskDisplayName": "Insights Task High",
    },
    "ruleId": "insights-task-high",
  },
  {
    "message": {
      "text": "hi",
    },
    "properties": {
      "category": "foo",
      "group": undefined,
      "taskDisplayName": "Migration Task High",
    },
    "ruleId": "migration-task-high",
  },
  {
    "message": {
      "text": "hi",
    },
    "properties": {
      "category": "baz",
      "group": undefined,
      "taskDisplayName": "Recommendations Task High",
    },
    "ruleId": "recommendations-task-high",
  },
  {
    "message": {
      "text": "hi",
    },
    "properties": {
      "category": "baz",
      "group": undefined,
      "taskDisplayName": "Migration Task Low",
    },
    "ruleId": "migration-task-low",
  },
  {
    "message": {
      "text": "hi",
    },
    "properties": {
      "category": "bar",
      "group": undefined,
      "taskDisplayName": "Recommendations Task Low",
    },
    "ruleId": "recommendations-task-low",
  },
]
`);
    expect(errors).toHaveLength(0);
  });

  it('Correctly captures fatal errors in tasks', async () => {
    let taskList = new TaskList();

    taskList.registerTask(new FatalErrorTask(getTaskContext()));

    let [results, errors] = await taskList.runTasks();

    expect(results).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].taskName).toEqual('fake/error-task');
    expect(errors[0].error).toEqual(STABLE_ERROR);
  });

  it('Correctly captures non-fatal errors in tasks', async () => {
    let taskList = new TaskList();

    taskList.registerTask(new NonFatalErrorTask(getTaskContext()));

    let [results, errors] = await taskList.runTasks();

    expect(results).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].taskName).toEqual('fake/non-fatal-error-task');
    expect(errors[0].error).toEqual(STABLE_ERROR);
  });
});
