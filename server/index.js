import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import AuthRoutes from "./routes/authRoutes.js";
import TodoRoutes from "./routes/todosRoutes.js";
import folderRoutes from "./routes/folders.js";
import { startCronJobs } from "./services/cronService.js";

dotenv.config();
const app = express();
startCronJobs();

const Port = process.env.PORT || 3002;
const DbPassword = process.env.DB_PASSWORD;
const DbUser = process.env.DB_USER;
const MONGO_URI = `mongodb+srv://${DbUser}:${DbPassword}@todo.y4zsq8v.mongodb.net/TodoDB`;

app.use(cors());
app.use(express.json());

let cachedDb = null;

const connectDB = async () => {
  if (cachedDb) {
    return cachedDb;
  }
  // Если база спит (холодный старт) - ждем подключения
  const db = await mongoose.connect(MONGO_URI);
  cachedDb = db;
  console.log("DB Connected Serverless Style");
  return db;
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DB Connection Error: ", error);
    res.status(500).json({ message: "Ошибка подключения к базе данных" });
  }
});

app.use("/api", AuthRoutes);
app.use("/api", TodoRoutes);
app.use("/api", folderRoutes);

if (process.env.NODE_ENV !== "production") {
  app.listen(Port, () => console.log(`Server running on ${Port}`));
}

export default app;
