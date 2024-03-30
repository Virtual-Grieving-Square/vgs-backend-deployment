import express from 'express';

// Controller
import {
  contactUs
} from '../controller/user/contactus';

const router = express.Router();

router.post("/contact", contactUs);

export default router; 