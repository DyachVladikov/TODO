import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "../models/Users.js";

export const registration = async (req, res) => {
  try {
    const { login, password } = req.body;

    console.log(login, password);

    if (!login || !password) {
      return res
        .status(400)
        .json({ message: "Login and password are required" });
    }

    const existing = await Users.findOne({ login });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Users.create({ login, password: hashedPassword });

    console.log(user);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({ token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const authorization = async (req, res) => {
  try {
    const { login, password } = req.body;

    console.log(login, password);

    if (!login || !password) {
      return res
        .status(400)
        .json({ message: "Login and password are required" });
    }

    const user = await Users.findOne({ login });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({ token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await Users.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
export const telegramAuth = async (req, res) => {
  try {
    // Получаем данные, которые пришлет React
    const { telegramId, first_name, username } = req.body;

    if (!telegramId) {
      return res.status(400).json({ message: "Нет данных Telegram" });
    }

    // 1. Ищем пользователя в базе
    let user = await User.findOne({ telegramId });

    // 2. Если его нет — создаем автоматически
    if (!user) {
      user = new User({
        telegramId: String(telegramId), // На всякий случай переводим в строку
        name: first_name || username || "Пользователь ТГ",
      });
      await user.save();
    }

    // 3. Генерируем точно такой же токен, как при обычном логине
    const token = jwt.sign(
      { _id: user._id }, // Убедись, что тут '_id' или 'id' — как у тебя в обычном логине
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    // 4. Отвечаем фронтенду
    res.json({ token, user, message: "Успешный вход через Telegram" });
  } catch (error) {
    console.error("Ошибка TG Auth:", error);
    res.status(500).json({ message: "Ошибка авторизации через Telegram" });
  }
};
