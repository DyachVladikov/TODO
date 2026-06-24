import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "../models/Users.js";
import QrSession from "../models/QrSession.js";

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
    const { telegramId, first_name, username } = req.body;

    if (!telegramId) {
      return res.status(400).json({ message: "Нет данных Telegram" });
    }

    // === УЛУЧШЕННЫЙ UPSERT ===
    const user = await Users.findOneAndUpdate(
      { telegramId: String(telegramId) },
      {
        // $set обновляет эти поля всегда
        $set: {
          telegramId: String(telegramId),
          name: first_name || username || "Пользователь ТГ",
        },
        // $setOnInsert срабатывает ТОЛЬКО при создании нового юзера
        $setOnInsert: {
          login: `tg_${telegramId}`, // Уникальный фейковый логин
          password: `tg_pass_${Date.now()}`, // Фейковый пароль-заглушка
        },
      },
      {
        new: true,
        upsert: true,
      },
    );

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({ token, user, message: "Успешный вход через Telegram" });
  } catch (error) {
    console.error("Ошибка TG Auth:", error);
    // Теперь передаем реальную ошибку базы на фронт для отладки
    res
      .status(500)
      .json({
        message: "Ошибка авторизации через Telegram",
        details: error.message,
      });
  }
};

export const generateQrSession = async (req, res) => {
  try {
    const sessionId = crypto.randomUUID();

    const newSession = new QrSession({ sessionId });
    await newSession.save();

    res.json({ sessionId });
  } catch (error) {
    console.error("ОШИБКА QR:", error);
    res.status(500).json({ message: "Ошибка генерации QR" });
  }
};

export const checkQrStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await QrSession.findOne({ sessionId });

    if (!session) {
      return res
        .status(404)
        .json({ status: "expired", message: "Сессия истекла" });
    }

    if (session.status === "completed") {
      return res.json({ status: "completed", token: session.token });
    }

    res.json({ status: "pending" });
  } catch (error) {
    console.error("ОШИБКА QR:", error);
    res.status(500).json({ message: "Ошибка проверки статуса" });
  }
};

export const telegramWebhook = async (req, res) => {
  try {
    const { message } = req.body;

    if (message && message.text && message.text.startsWith("/start")) {
      const text = message.text;
      const telegramId = String(message.from.id);
      const first_name = message.from.first_name;
      const username = message.from.username;

      if (text.includes("login_")) {
        const sessionId = text.split("login_")[1];

        // === УЛУЧШЕННЫЙ UPSERT ДЛЯ ВЕБХУКА ===
        const user = await Users.findOneAndUpdate(
          { telegramId: telegramId },
          {
            $set: {
              telegramId: telegramId,
              name: first_name || username || "Пользователь ТГ",
            },
            $setOnInsert: {
              login: `tg_${telegramId}`,
              password: `tg_pass_${Date.now()}`,
            },
          },
          {
            new: true,
            upsert: true,
          },
        );

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        const session = await QrSession.findOne({
          sessionId,
          status: "pending",
        });

        if (session) {
          session.status = "completed";
          session.token = token;
          await session.save();
        }
      }
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Ошибка вебхука:", error);
    return res.status(200).send("OK");
  }
};
