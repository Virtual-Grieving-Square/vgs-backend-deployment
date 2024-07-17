import { Request, Response } from "express";
import NotifModel, { INotif } from "../model/notification";

export async function addNotificationFunction(
  Note: string,
  userID: string,
  type: string,
  sendeId: string,
  notificationtype: string
): Promise<INotif> {
  try {
    const newNotification: INotif = new NotifModel({
      Note,
      userID,
      seen: false,
      type,
      sendeId,
      notificationtype
    });
    const savedNotification = await newNotification.save();
    return savedNotification;
  } catch (error) {
    throw new Error(`Error adding notification: ${error}`);
  }
}

export const addNotification = async (req: Request, res: Response) => {
  try {
    const { Note, userID } = req.body;
    const newNotification: INotif = new NotifModel({
      Note,
      userID,
      seen: false,
    });
    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(500).json({ message: "Error adding notification", error });
  }
};

export const viewNotificationsByUserID = async (
  req: Request,
  res: Response
) => {
  try {
    const { userID } = req.params;
    // const notifications = await NotifModel.find({ userID });
    const notifications = await NotifModel.find({ userID }).sort({
      createdAt: -1,
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving notifications", error });
  }
};

export const showNotificationsBySeenStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { userID, seen } = req.params;
    const notifications = await NotifModel.find({
      userID,
      seen: seen === "true",
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving notifications", error });
  }
};

// Update notification based on userID to make seen = true
export const markNotificationsAsSeen = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const updatedNotifications = await NotifModel.updateMany(
      { userID, seen: false },
      { seen: true }
    );
    res.status(200).json(updatedNotifications);
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications", error });
  }
};
