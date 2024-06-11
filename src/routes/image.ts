import express from 'express';
import { getImage, uploadFuneralImage } from '../controller/image';
import multer from 'multer';

const router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


router.get('/', getImage);
router.post('/uploadFuneralImage', upload.single('image'), uploadFuneralImage);
export default router; 