import express from 'express';
import { apigatway, index } from '../controller';

const router = express.Router();

router.get('/', index);
router.get('/aws-socket', apigatway);
export default router; 