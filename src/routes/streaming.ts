import express from 'express';

// Controller
import {
  startStreaming,
  stopStreamin,
  streamingStatus,
  twilioStreaming,
} from '../controller/streaming';

const router = express.Router();

// live streaming 
router.post("/startStreamin", startStreaming);
router.post("/addSubscription/:broadcastId", stopStreamin);
router.post("/addSubscription/:broadcastId", streamingStatus);
router.post("/twilioStreaming", twilioStreaming);

export default router;