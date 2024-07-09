
import { sendNotification } from '../middleware/notification';
import { getCommentNotificationPayload, getLikeNotificationPayload } from './notificationPayloads';

interface SendCommentNotificationOptions {
  postOwnerToken: string;
  commenterName: string;
  postTitle: string;
}

interface SendLikeNotificationOptions {
  commenterToken: string;
  likerName: string;
  postTitle: string;
}

const sendCommentNotification = async ({ postOwnerToken, commenterName, postTitle }: SendCommentNotificationOptions) => {
  const payload = getCommentNotificationPayload(commenterName, postTitle);
  await sendNotification({ token: postOwnerToken, payload });
};

const sendLikeNotification = async ({ commenterToken, likerName, postTitle }: SendLikeNotificationOptions) => {
  const payload = getLikeNotificationPayload(likerName, postTitle);
  await sendNotification({ token: commenterToken, payload });
};

export { sendCommentNotification, sendLikeNotification };
