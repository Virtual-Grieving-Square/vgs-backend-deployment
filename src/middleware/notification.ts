// src/middleware/notification.ts
import { messaging } from "../firebase";

interface NotificationPayload {
  title: string;
  body: string;
  data?: any;
}

interface SendNotificationOptions {
  token: string;
  payload: any;
}

const sendNotification = async ({
  token,
  payload,
}: SendNotificationOptions) => {
  try {
    console.log(token);
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      token: token,
    };

    const response = await messaging.send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

export { sendNotification };
