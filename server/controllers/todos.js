import Todo from "../models/Todo.js";

// Хелпер: превращает массив минут [15, 60] в готовые объекты для базы
const buildReminders = (deadline, reminderMinutes) => {
  if (!deadline || !reminderMinutes || !Array.isArray(reminderMinutes))
    return [];

  const deadlineDate = new Date(deadline);

  return reminderMinutes.map((minutes) => {
    // Вычитаем миллисекунды (минуты * 60 секунд * 1000) из дедлайна
    const triggerAt = new Date(deadlineDate.getTime() - minutes * 60000);
    return {
      minutesBefore: minutes,
      triggerAt,
      sent: false,
    };
  });
};

export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json(todos);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const createTodo = async (req, res) => {
  try {
    const {
      title,
      notes,
      priority,
      deadline,
      projectId,
      tags,
      important,
      reminderMinutes,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Генерируем массив напоминаний
    const reminders = buildReminders(deadline, reminderMinutes);

    const todo = await Todo.create({
      title,
      notes,
      priority,
      deadline,
      projectId,
      tags: tags || [],
      checkList: [],
      important: important || false, // Теперь берем значение прямо с фронтенда
      reminders, // Сохраняем вычисленные даты
      userId: req.userId,
    });

    return res.status(201).json(todo);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Если фронт прислал новый дедлайн или изменил напоминания — пересчитываем их
    if (
      updates.deadline !== undefined ||
      updates.reminderMinutes !== undefined
    ) {
      updates.reminders = buildReminders(
        updates.deadline,
        updates.reminderMinutes,
      );
      // Удаляем "сырой" массив минут, чтобы не засорять документ в базе
      delete updates.reminderMinutes;
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: updates },
      { new: true },
    );

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    return res.status(200).json(todo);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOneAndDelete({ _id: id, userId: req.userId });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    return res.status(200).json({ success: true, id: todo._id });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
