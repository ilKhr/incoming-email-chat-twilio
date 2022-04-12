import { Twilio } from "twilio";
import {
  TaskInstance,
  TaskListInstanceOptions,
} from "twilio/lib/rest/taskrouter/v1/workspace/task";

export const fetchTasksFromWorkspace = async (
  client: Twilio,
  workspaceSid: string,
  condition?: TaskListInstanceOptions
) => {
  let tasks: TaskInstance[] | undefined;
  try {
    tasks = await client.taskrouter
      .workspaces(workspaceSid)
      .tasks.list(condition);
  } catch (e) {
    console.log(e);
    return;
  }
  return tasks;
};
