import express from 'express';
import { getImage } from '../controller/image';

const router = express.Router();

router.get('/', getImage);

export default router; 