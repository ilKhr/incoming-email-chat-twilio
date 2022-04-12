import { Twilio } from "twilio";
import { TaskInstance } from "twilio/lib/rest/taskrouter/v1/workspace/task";

export const createNewTask = async (
  client: Twilio,
  attributes: Record<string, unknown>,
  workspaceSid: string,
  workflowSid: string
) => {
  let task: TaskInstance | undefined;
  try {
    task = await client.taskrouter.workspaces(workspaceSid).tasks.create({
      attributes: JSON.stringify({
        ...attributes,
      }),
      workflowSid,
    });
  } catch (e) {
    console.log("Error task create", e);
    return;
  }
  return task;
};
