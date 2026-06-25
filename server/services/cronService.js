import Todo from "../models/Todo.js";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const sendTelegramMessage = async (chatId, text) => {
  try {
    const response = await fetch(
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
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
};

export const executeCron = async (req, res) => {
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

    if (tasks.length === 0) {
      return res.status(200).json({ message: "Нет задач для отправки" });
    }

    const taskPromises = tasks.map(async (task) => {
      let isModified = false;
      const telegramPromises = [];

      for (const reminder of task.reminders) {
        if (!reminder.sent && reminder.triggerAt <= now) {
          const userChatId = task.userId?.telegramId;

          if (userChatId) {
            const text = `🔔 <b>Напоминание!</b>\n\n📝 Задача: <b>${task.title}</b>\n⏰ Дедлайн: ${new Date(task.deadline).toLocaleString("ru-RU")}`;
            telegramPromises.push(sendTelegramMessage(userChatId, text));
          }

          reminder.sent = true;
          isModified = true;
        }
      }

      await Promise.all(telegramPromises);

      if (isModified) {
        return task.save();
      }
    });

    await Promise.all(taskPromises);

    return res.status(200).json({ success: true, processed: tasks.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
