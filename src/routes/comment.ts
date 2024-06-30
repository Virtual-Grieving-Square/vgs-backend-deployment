import { Router } from 'express';
import {
  blockComment,
  fetchComments,
  unblockComment
} from '../controller/comment';

const router = Router();

router.get("/:id", fetchComments);

router.put("/block", blockComment);
router.put("/unblock", unblockComment);

export default router;