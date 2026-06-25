import cron from "node-cron";
import Todo from "../models/Todo.js";
import User from "../models/Users.js";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "ТВОЙ_ТОКЕН_БОТА";

// Функция отправки сообщения в ТГ
const sendTelegramMessage = async (chatId, text) => {
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "HTML",
        }),
      },
    );
  } catch (error) {
    console.error(`Ошибка отправки сообщения пользователю ${chatId}:`, error);
  }
};

export const startCronJobs = () => {
  console.log("🕒 Cron сервис запущен...");

  // Запускаем проверку каждую минуту: * * * * *
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const tasks = await Todo.find({
        completed: false,
        reminders: {
          $elemMatch: {
            sent: false,
            triggerAt: { $lte: now },
          },
        },
      }).populate("userId");

      if (tasks.length === 0) return;

      for (const task of tasks) {
        let isModified = false;

        for (const reminder of task.reminders) {
          if (!reminder.sent && reminder.triggerAt <= now) {
            const userChatId = task.userId.telegramId;

            if (userChatId) {
              const text = `🔔 <b>Напоминание!</b>\n\n📝 Задача: <b>${task.title}</b>\n⏰ Дедлайн: ${new Date(task.deadline).toLocaleString("ru-RU")}`;

              await sendTelegramMessage(userChatId, text);
            }
            reminder.sent = true;
            isModified = true;
          }
        }
        if (isModified) {
          await task.save();
        }
      }
    } catch (error) {
      console.error("Ошибка в работе Cron:", error.message);
    }
  });
};
