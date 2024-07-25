import express from 'express';

// Cookies
import { addCookie, checkCookie } from '../controller/cookies';

// Middleware
import { checkAdminState } from '../middleware/adminState';

const router = express.Router();

router.get('/', addCookie);
router.get('/check', checkAdminState, checkCookie);

export default router; 