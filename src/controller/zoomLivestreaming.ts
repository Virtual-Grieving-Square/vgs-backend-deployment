import { Request, Response } from "express";
import { LiveStreamingModel, Livestreaming } from "../model/livestreaming"; // Assuming you have a Subscription model
import { UserModel, User } from "../model/user";

export const saveStreaming = async (meetingData: any, userdata: any) => {
  try {
    console.log(userdata);

    const newLiveStream = new LiveStreamingModel({
      meetingId: meetingData.id,
      password: meetingData.password,
      creator: userdata.UserID,
      link: meetingData.start_url,
      joinLink: meetingData.join_url,
      topic: meetingData.topic,
      image: userdata.image || "",
      dob: userdata.dob,
      dod: userdata.dod,
      description: userdata.description,
    });

    const savedLiveStream = await newLiveStream.save();

    return savedLiveStream;
  } catch (error) {
    console.error("Error saving livestreaming:", error);
    throw error;
  }
};

export const getLivestreamingDataWithinLastHour = async (): Promise<
  Livestreaming[]
> => {
  try {
    const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);

    const livestreamingData = await LiveStreamingModel.find({
      createdAt: { $gte: sixtyMinutesAgo },
    });

    return livestreamingData;
  } catch (error) {
    console.error(
      "Error retrieving livestreaming data within last hour:",
      error
    );
    throw error;
  }
};
