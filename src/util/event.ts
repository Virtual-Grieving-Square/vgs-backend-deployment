import { io } from "../index";
import NotifModel, { INotif } from "../model/notification";
import { UserModel, User } from "../model/user";

interface DataToSend {
  user: string;
  userID: string;
  msg: string;
  type: "like" | "comment";
}

// Helper function to construct the data to send
const constructDataToSend = (
  user: User,
  message: string,
  type: "like" | "comment"
): DataToSend => {
  return {
    user: `${user.firstName} ${user.lastName}`,
    userID: user._id.toString(),
    msg: message,
    type: type,
  };
};

const saveNotification = async (
  userId: string,
  message: string,
  type: "like" | "comment"
): Promise<void> => {
  try {
    const notification: Partial<INotif> = {
      userID: userId,
      Note: message,
      seen: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await NotifModel.create(notification);
  } catch (error) {
    console.error("Error saving notification:", error);
  }
};

// Emit like update
export const emitLikeUpdate = async (
  userId: any,
  data: string
): Promise<void> => {
  try {
    const user: User | null = await UserModel.findById(userId);
    if (!user) {
      console.error("User not found");
      return;
    }

    const dataToSend = constructDataToSend(user, data, "like");
    io.to(user.socketId).emit("realtime-notification", dataToSend);
    await saveNotification(userId, data, 'like');
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

// Emit comment update
export const emitCommentUpdate = async (
  userId: any,
  data: string
): Promise<void> => {
  try {
    const user: User | null = await UserModel.findById(userId);
    if (!user) {
      console.error("User not found");
      return;
    }

    const dataToSend = constructDataToSend(user, data, "comment");
    io.to(user.socketId).emit("realtime-notification", dataToSend);
    await saveNotification(userId, data, 'comment');
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};
