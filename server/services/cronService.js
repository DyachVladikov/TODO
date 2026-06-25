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
      return res.status(200).json({
        message: "Нет задач для отправки",
        systemTime: now.toISOString(),
      });
    }

    const debugReport = [];

    for (const task of tasks) {
      let isModified = false;
      const taskLog = {
        taskId: task._id,
        taskTitle: task.title,
        userIdRaw: task.userId,
        telegramIdFromDb: task.userId?.telegramId || null,
        telegramApiResult: null,
      };

      for (const reminder of task.reminders) {
        if (!reminder.sent && reminder.triggerAt <= now) {
          const userChatId = task.userId?.telegramId;

          if (userChatId) {
            const text = `🔔 <b>Напоминание!</b>\n\n📝 Задача: <b>${task.title}</b>\n⏰ Дедлайн: ${new Date(task.deadline).toLocaleString("ru-RU")}`;
            const tgResult = await sendTelegramMessage(userChatId, text);
            taskLog.telegramApiResult = tgResult;
          }

          reminder.sent = true;
          isModified = true;
        }
      }

      if (isModified) {
        await task.save();
      }
      debugReport.push(taskLog);
    }

    return res.status(200).json({ success: true, debugReport });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
