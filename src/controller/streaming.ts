import { Request, Response } from "express";
import SubscriptionModel from "../model/Subscription";
import { UserModel, User } from "../model/user";
import { google } from "googleapis";

const accountSid = "AC85c0958b9233dd8246253e535b117ded";
const authToken = "b99fae6f3005ab9782b64eccb719b322";

const client = require('twilio')(accountSid, authToken);

const videoGrant = client.VideoGrant;

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/youtube.force-ssl"],
});

const youtube = google.youtube({
  version: "v3",
  auth: auth,
});

export const startStreaming = async (req: Request, res: Response) => {
  try {
    const response = await youtube.liveBroadcasts.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: "My Live Stream",
          scheduledStartTime: new Date().toISOString(),
        },
        status: {
          privacyStatus: "public",
        },
      },
    });
    const responseData = response.data;

    res.json(responseData);
  } catch (error) {
    console.error("Error starting broadcast:", error);
    res.status(500).json({ error: "Failed to start the live stream" });
  }
};

export const stopStreamin = async (req: Request, res: Response) => {
  const { broadcastId } = req.params;

  try {
    await youtube.liveBroadcasts.transition({
      broadcastStatus: "complete",
      id: broadcastId,
      part: ["id", "status"],
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Error stopping broadcast:", error);
    res.status(500).json({ error: "Failed to stop the live stream" });
  }
};

export const streamingStatus = async (req: Request, res: Response) => {
  //   const { broadcastId } = req.params;

  //   try {
  //     const response = await youtube.liveBroadcasts.list({
  //         part: ['id', 'status'],
  //         id: broadcastId
  //     });

  //     res.json(response.data);
  //   } catch (error) {
  //     console.error("Error getting broadcast status:", error);
  //     res.status(500).json({ error: "Failed to get stream status" });
  //   }
};

export const twilioStreaming = async (req: Request, res: Response) => {
  try {
    client.video.v1.rooms.create({ type: 'go', uniqueName: 'My First Video Room' })
      .then((room: any) => console.log(room.sid));



  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get stream status" });
  }
}