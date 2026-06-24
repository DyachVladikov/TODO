import express from "express";
import {
  registration,
  authorization,
  getMe,
  telegramAuth,
} from "../controllers/users.js";
import { authMiddleware } from "../middleware/auth.js";

const Routes = new express.Router();

Routes.post("/auth/registration", registration);
Routes.post("/auth/login", authorization);
Routes.get("/auth/me", authMiddleware, getMe);
Routes.post("/auth/telegram", telegramAuth);
Routes.get("/auth/qr/generate", generateQrSession);
Routes.get("/auth/qr/check/:sessionId", checkQrStatus);
Routes.post("/auth/telegram/webhook", telegramWebhook);

export default Routes;
