import { Twilio } from "twilio";
import { ChannelInstance } from "twilio/lib/rest/flexApi/v1/channel";

export const createNewChannel = async (
  client: Twilio,
  flexFlowSid: string,
  chatUserName: string,
  chatFriendlyName: string,
  attributes: Record<string, unknown> = {},
  taskSid?: string
) => {
  let newChannel: ChannelInstance | undefined;
  try {
    newChannel = await client.flexApi.channel.create({
      flexFlowSid,
      chatFriendlyName,
      identity: chatUserName,
      chatUserFriendlyName: chatUserName,
      target: chatUserName,
      taskAttributes: JSON.stringify({
        ...attributes,
      }),
      ...(taskSid ? { taskSid } : undefined),
    });
  } catch (err) {
    console.log(err);
    return;
  }

  return newChannel;
};
