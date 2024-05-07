import express from "express";
import { create, getAll, getByNumber, getImage } from "../controller/famous";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/getAll", getAll);
router.get("/getByNumber/:number", getByNumber);
router.post("/create", upload.single("image"), create);
router.get('/getImage', getImage);

export default router;
