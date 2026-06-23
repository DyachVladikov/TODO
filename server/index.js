import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import AuthRoutes from "./routes/authRoutes.js";
import TodoRoutes from "./routes/todosRoutes.js";
import folderRoutes from "./routes/folders.js";

dotenv.config();
const app = express();

const Port = process.env.PORT || 3002;
const DbPassword = process.env.DB_PASSWORD;
const DbUser = process.env.DB_USER;

app.use(cors());
app.use(express.json());

app.use("/api", AuthRoutes);
app.use("/api", TodoRoutes);
app.use("/api", folderRoutes);

mongoose
  .connect(
    `mongodb+srv://${DbUser}:${DbPassword}@todo.y4zsq8v.mongodb.net/TodoDB`,
  )
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("DB Connection Error: ", err));

if (process.env.NODE_ENV !== "production") {
  app.listen(Port, () => console.log(`Server running on ${Port}`));
}

export default app;
