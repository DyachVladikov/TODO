import express from "express";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../controllers/todos.js";
import { authMiddleware } from "../middleware/auth.js";

const Routes = new express.Router();

Routes.get("/todos", authMiddleware, getTodos);
Routes.post("/todos", authMiddleware, createTodo);
Routes.put("/todos/:id", authMiddleware, updateTodo);
Routes.delete("/todos/:id", authMiddleware, deleteTodo);

export default Routes;
