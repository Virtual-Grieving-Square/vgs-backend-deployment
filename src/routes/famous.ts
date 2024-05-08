import express from "express";
import {
  create,
  deleteData,
  getAll,
  getById,
  getByNumber,
  getImage
} from "../controller/famous";

import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Get Items
router.get("/getAll", getAll);
router.get('/getById/:id', getById);

router.get("/getByNumber/:number", getByNumber);
router.post("/create", upload.single("image"), create);
router.get('/getImage', getImage);

// Delete Function
router.delete("/delete/:id", deleteData);

export default router;
