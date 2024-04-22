import { Response, Request } from "express";
import { createZoomMeeting } from "../util/zoomFunctions";
import { generateVideoSdkApiJwt } from "../util/videoSDK";

export const startMeeting = async (req: Request, res: Response) => {
  try {
    const { topic, startTime } = req.body;

    if (!topic || !startTime) {
      return res
        .status(400)
        .json({ message: "Topic and startTime are required." });
    }

    const meeting = await createZoomMeeting(topic, startTime);

    res.status(200).json({ meeting });
  } catch (error) {
    console.error("Error starting Zoom meeting:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const generateVideoSdk = async (req: Request, res: Response) => {
  try {
    const response = await generateVideoSdkApiJwt();
    console.log(response);
    res.status(200).json({ response });
  } catch (err) {
    res.status(400).json({ err });
  }
};
