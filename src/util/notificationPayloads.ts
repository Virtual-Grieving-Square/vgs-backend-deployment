
interface NotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
}

const getCommentNotificationPayload = (
  commenterName: string,
  postTitle: string
): NotificationPayload => {
  return {
    title: "New Comment on Your Post",
    body: `${commenterName} commented on your post: "${postTitle}"`,
    data: {
      type: "comment",
    },
  };
};

const getLikeNotificationPayload = (
  likerName: string,
  postTitle: string
): NotificationPayload => {
  return {
    title: "Your Comment Got a Like",
    body: `${likerName} liked your comment on the post: "${postTitle}"`,
    data: {
      type: "like",
    },
  };
};

export { getCommentNotificationPayload, getLikeNotificationPayload };
