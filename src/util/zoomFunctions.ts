import axios from "axios";
import jwt from "jsonwebtoken";
import config from "../config";

async function createZoomMeeting(
  topic: string,
  startTime: string
): Promise<any> {
  try {
    
    const apiKey: string = config.zoomAPI;
    const apiSecret: string = config.zoomSEC;
    const token: string = generateJWT(); 

    const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic: topic,
        type: 2, 
        start_time: startTime,
        duration: 60,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error creating Zoom meeting:", error.response.data);
    throw error;
  }
}

function generateJWT(): string {
  const apiSecret = config.zoomSEC;
  const apiKey = config.zoomAPI;
  const payload = {
    iss: apiKey, // API Key provided by Zoom
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // Expiration time (current time + 1 hour)
  };

  const token = jwt.sign(payload, apiSecret);

  return token;
}

export { createZoomMeeting };
