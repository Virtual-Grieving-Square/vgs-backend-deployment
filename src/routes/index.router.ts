import express from 'express';
import { index } from '../controller/user';

const router = express.Router();

router.get('/', index);

export default router;