import express from "express";
import { generateVideoSdk, startMeeting } from "../controller/ZoomCtrl";

const router = express.Router();

router.post("/startMeeting", startMeeting);
router.post("/generateJWT", generateVideoSdk);

export default router;
