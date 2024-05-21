import express, { Request, Response } from "express";
import axios from "axios";
import { ZOOM_API_BASE_URL } from "../constants";
import errorHandler from "../util/errorHandler";
import {
  getLivestreamingDataWithinLastHour,
  saveStreaming,
} from "../controller/zoomLivestreaming";

const router = express.Router();

interface CustomRequest extends Request {
  headerConfig?: { headers: { Authorization: string } };
}

/**
 * Get a meeting
 * https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meeting
 */
router.get("/:meetingId", async (req: CustomRequest, res: Response) => {
  try {
    const { headerConfig, params } = req;
    const { meetingId } = params;


    const request = await axios.get(
      `${ZOOM_API_BASE_URL}/meetings/${meetingId}`,
      headerConfig
    );
    return res.json(request.data);
  } catch (err) {
    return errorHandler(err, res, `Error fetching meeting`);
  }
});

/**
 * Create a meeting
 * https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingCreate
 */
router.post("/:userId", async (req: CustomRequest, res: Response) => {
  try {
    console.log("Here");
    console.log(req.body)
    const { headerConfig, params, body, file } = req;
    const { userId } = params;
    console.log(body);
    console.log(userId);

    const newBody = {
      "agenda": body.name,
      "topic": body.topic,
      settings: {
        auto_recording: "cloud",
      }
    }

    const request = await axios.post(
      `${ZOOM_API_BASE_URL}/users/${userId}/meetings`,
      newBody,
      headerConfig
    );

    await saveStreaming(request.data, body, file);

    return res.json(request.data);
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ error: "Internal server error" });
  };
});

/**
 * Update a meeting
 * https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingUpdate
 */
router.patch("/:meetingId", async (req: CustomRequest, res: Response) => {
  try {
    const { headerConfig, params, body } = req;
    const { meetingId } = params;


    const request = await axios.patch(
      `${ZOOM_API_BASE_URL}/meetings/${meetingId}`,
      body,
      headerConfig
    );
    return res.json(request.data);
  } catch (err) {
    return errorHandler(err, res, `Error updating meeting`);
  }
});

/**
 * Delete a meeting
 * https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingDelete
 */
router.delete("/:meetingId", async (req: CustomRequest, res: Response) => {
  try {
    const { headerConfig, params } = req;
    const { meetingId } = params;


    const request = await axios.delete(
      `${ZOOM_API_BASE_URL}/meetings/${meetingId}`,
      headerConfig
    );
    return res.json(request.data);
  } catch (err) {
    return errorHandler(err, res, `Error deleting meeting`);
  }
});

/**
 * Get a meeting
 * https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meeting
 */
router.get(
  "/getallMeeting/:userId",
  async (req: CustomRequest, res: Response) => {
    try {
      const { headerConfig, params, query } = req;
      const { userId } = params;


      // const params = new URLSearchParams({ next_page_token });
      // const request = await axios.get(
      //   `${ZOOM_API_BASE_URL}/report/meetings/${meetingId}/participants?${params}`,
      //   headerConfig
      // );
      // return res.json(request.data);
    } catch (err) {
      return errorHandler(
        err,
        res,
        `Error fetching meetings for user`);
    }
  }
);

router.get("/db/getusersMeeting", async (req: CustomRequest, res: Response) => {
  try {
    const livestreamingDataBeforeTime =
      await getLivestreamingDataWithinLastHour();

    return res.status(200).json(livestreamingDataBeforeTime);
  } catch (err) {
    console.log(err);
    return errorHandler(err, res, `Error fetching meetings live meeting`);
  }
});

/**
 * Get meeting participant reports
 * https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/reportMeetingParticipants
 */
// router.get(
//   "/:meetingId/report/participants",
//   async (req: CustomRequest, res: Response) => {
//     const { headerConfig, params, query } = req;
//     const { meetingId } = params;
//     const { next_page_token } = query;

//     try {
//       const params = new URLSearchParams({ next_page_token });
//       const request = await axios.get(
//         `${ZOOM_API_BASE_URL}/report/meetings/${meetingId}/participants?${params}`,
//         headerConfig
//       );
//       return res.json(request.data);
//     } catch (err) {
//       return errorHandler(
//         err,
//         res,
//         `Error fetching participants for meeting: ${meetingId}`
//       );
//     }
//   }
// );

/**
 * Delete meeting recordings
 * https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/recordingDelete
 */
// router.delete(
//   "/:meetingId/recordings",
//   async (req: CustomRequest, res: Response) => {
//     const { headerConfig, params, query } = req;
//     const { meetingId } = params;
//     const { action } = query;

//     try {
//       if (action!) {
//         return res.status(400).json({meg: "missing action"})
//       }
//       const params = new URLSearchParams({ action });
//       const request = await axios.delete(
//         `${ZOOM_API_BASE_URL}/meetings/${meetingId}/recordings?${params}`,
//         headerConfig
//       );
//       return res.json(request.data);
//     } catch (err) {
//       return errorHandler(
//         err,
//         res,
//         `Error deleting recordings for meeting: ${meetingId}`
//       );
//     }
//   }
// );

export default router;
