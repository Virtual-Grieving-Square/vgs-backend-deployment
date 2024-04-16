import express from "express";
import { renderRoom, startLive } from "../controller/liveStreaming";

const router = express.Router();

router.get("/start", startLive);



router.get("/:room", renderRoom);



export default router;


