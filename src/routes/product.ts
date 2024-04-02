import express from 'express';
import { addProduct } from '../controller/product';

const router = express.Router();

router.post('/addProduct', addProduct);



export default router;