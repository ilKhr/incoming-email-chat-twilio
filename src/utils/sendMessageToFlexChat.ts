import { Twilio } from "twilio";
import axios from "axios";
import { TwilioResponsePayload } from "twilio/lib/base/Page";

export const sendMessageToFlexChat = async (
  client: Twilio,
  serviceSid: string,
  channelSid: string,
  chatUserName: string,
  body: string
) => {
  console.log("Sending new chat message");
  const params = new URLSearchParams();
  params.append("Body", body);
  params.append("From", chatUserName);
  let message;
  try {
    message = await client.chat
      .services(serviceSid)
      .channels(channelSid)
      .messages.create({ body });
  } catch (e) {
    console.log(e);
    return;
  }
  return message;
};
