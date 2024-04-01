import express from 'express';

// Controller
import {
  contactUs
} from '../controller/contact';

const router = express.Router();

router.post("/contact", contactUs);

export default router; 