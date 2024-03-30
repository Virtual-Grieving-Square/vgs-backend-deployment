import express from 'express';

// Controller
import {
  startStreaming,
  stopStreamin,
  streamingStatus,
} from '../controller/user/streaming';

const router = express.Router();

// live streaming 
router.post("/startStreamin", startStreaming);
router.post("/addSubscription/:broadcastId", stopStreamin);
router.post("/addSubscription/:broadcastId", streamingStatus);

export default router;