import express from "express";
import { registration, authorization, getMe } from "../controllers/users.js";
import { authMiddleware } from "../middleware/auth.js";

const Routes = new express.Router();

Routes.post("/auth/registration", registration);
Routes.post("/auth/login", authorization);
Routes.get("/auth/me", authMiddleware, getMe);

export default Routes;
