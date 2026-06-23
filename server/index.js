import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import AuthRoutes from "./routes/authRoutes.js";
import TodoRoutes from "./routes/todosRoutes.js";
import folderRoutes from "./routes/folders.js";

const app = express();
dotenv.config();

const Port = process.env.PORT || 3002;
const DbPassword = process.env.DB_PASSWORD;
const DbUser = process.env.DB_USER;

app.use(cors());
app.use(express.json());

async function Start() {
  try {
    await mongoose
      .connect(
        `mongodb+srv://${DbUser}:${DbPassword}@todo.y4zsq8v.mongodb.net/TodoDB`,
      )
      .then(() => {
        console.log("DB Connected");
        app.listen(Port, () => console.log("Server running on 3002"));
      });
    app.use("/api", AuthRoutes);
    app.use("/api", TodoRoutes);
    app.use("/api", folderRoutes);
  } catch (error) {
    console.log(error);
  }
}

Start();

export default app;
