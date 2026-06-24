import jwt from "jsonwebtoken";
import User from "../models/Users.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
    if (!token) {
      return res.status(401).json({ message: "Нет доступа" });
    }

    // 1. Расшифровываем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. УБИЙЦА ЗОМБИ: Проверяем, существует ли пользователь в базе СЕЙЧАС
    const user = await User.findById(decoded.id || decoded._id);
    if (!user) {
      // Если пользователя нет в базе — токен мусор, выкидываем ошибку
      return res
        .status(401)
        .json({ message: "Пользователь не найден или удален" });
    }

    // 3. Всё ок, пускаем дальше
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Токен недействителен" });
  }
};
