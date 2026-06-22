import express from "express";
import {
  getFolders,
  createFolder,
  deleteFolder,
} from "../controllers/folders.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/folders", authMiddleware, getFolders);
router.post("/folders", authMiddleware, createFolder);
router.delete("/folders/:id", authMiddleware, deleteFolder);

export default router;
