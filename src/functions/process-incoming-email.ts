// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

type EventType = {
  from: string;
  to: string;
  subject: string;
  message: string;
};

import { VoicemailServiceContext } from "../types";
import { createNewTask } from "../utils/createNewTask";
import { createNewChannel } from "../utils/createNewChannel";
import { sendMessageToFlexChat } from "../utils/sendMessageToFlexChat";
import { fetchTasksFromWorkspace } from "../utils/fetchTasksFromWorkspace";

type FirstAttributes = {
  type: "email";
  from: string;
  to: string;
  subject: string;
  channelType?: string;
};

export type OtherAttributes = {
  channelSid: string;
  channelType: "custom";
  type: "email";
  from: string;
  to: string;
  subject: string;
};

export const handler: ServerlessFunctionSignature<
  VoicemailServiceContext,
  EventType
> = async (context, event, callback: ServerlessCallback) => {
  const response = new Twilio.Response();

  console.log("Event", event);
  if (!event.from || !event.to || !event.subject) {
    console.log("Event is empty");
    return callback(null, response);
  }

  let client: ReturnType<Context["getTwilioClient"]> | undefined;
  try {
    client = context.getTwilioClient();
  } catch (e) {
    console.log("Error get client", e);
    return callback(null, response);
  }

  const attributes: FirstAttributes = {
    channelType: "email",
    type: "email",
    from: event.from,
    to: event.to,
    subject: event.subject,
  };

  const channel = await createNewChannel(
    client,
    context.EMAIL_FLOW_SID,
    event.from,
    "Test email channel",
    attributes
  );

  console.log("Existed or new Channel", channel);

  if (!channel) {
    console.log("Error create channel");
    return callback(null, response);
  }

  const tasks = await fetchTasksFromWorkspace(client, context.WORKSPACE_SID, {
    evaluateTaskAttributes: `from == "${event.from}"`,
    assignmentStatus: ["assigned", "reserved", "pending"],
    limit: 5,
  });

  console.log("tasks", tasks);

  if (Array.isArray(tasks) && tasks.length) {
    const task = tasks.find((tmpTask) =>
      (["assigned", "reserved", "pending"] as ReadonlyArray<string>).includes(
        tmpTask.assignmentStatus
      )
    );

    if (!task) {
      console.log("Error get task");
      return callback(null, response);
    }

    console.log("Existed task", task);

    const attributes: OtherAttributes = JSON.parse(task.attributes);

    await sendMessageToFlexChat(
      client,
      context.SERVICE_SID,
      attributes.channelSid,
      event.from,
      event.message
    );

    return callback(null, response);
  }

  const newAttributes = {
    channelSid: channel.sid,
    ...attributes,
  };

  const task = await createNewTask(
    client,
    newAttributes,
    context.WORKSPACE_SID,
    context.WORLFLOW_SID
  );

  console.log("New task", task);

  if (!task) {
    console.log("Error create task");
    return callback(null, response);
  }

  console.log("New channel", channel);

  const message = await sendMessageToFlexChat(
    client,
    context.SERVICE_SID,
    channel.sid,
    event.from,
    event.message
  );

  if (!message) {
    console.log("Error create message");
    return callback(null, response);
  }

  callback(null, response);
};
