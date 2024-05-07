import express from "express";
import { create, getAll, getByNumber } from "../controller/famous";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/getAll", getAll);
router.get("/getByNumber/:number", getByNumber);
router.post("/create", upload.single("image"), create);

export default router;
