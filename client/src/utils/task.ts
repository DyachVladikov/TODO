import type { Priority, Task, Folder } from "@/api/types";
import type { DropdownOption } from "@/components/ModalDropdown";
import { hasSpecificTime } from "@/utils/date";

export interface PriorityMeta {
  label: string;
  color: string;
}

export const getPriorityMeta = (p: Priority): PriorityMeta => {
  switch (p) {
    case "high":
      return { label: "Срочно", color: "var(--color-status-error)" };
    case "medium":
      return { label: "Средний", color: "var(--color-status-warning)" };
    default:
      return { label: "Низкий", color: "var(--color-status-success)" };
  }
};

export const formatReminderLabel = (minutes: number) => {
  if (minutes < 60) return `За ${minutes} мин.`;
  if (minutes < 1440) return `За ${minutes / 60} ч.`;
  return `За ${minutes / 1440} дн.`;
};

export const PROJECT_OPTIONS: DropdownOption[] = [
  { value: "work", label: "Работа" },
  { value: "home", label: "Дом" },
  { value: "ideas", label: "Идеи" },
];

// Стандартные проекты для сайдбара (с цветовой меткой)
export interface DefaultProject {
  id: string;
  label: string;
  color: string;
}

export const DEFAULT_PROJECTS: DefaultProject[] = [
  { id: "work", label: "Работа", color: "#3B82F6" },
  { id: "home", label: "Дом", color: "#10B981" },
  { id: "ideas", label: "Идеи", color: "#8B5CF6" },
];

export const getProjectLabel = (projectId: string | undefined) =>
  PROJECT_OPTIONS.find((o) => o.value === projectId)?.label ?? "Входящие";

// Метаданные проекта (название + цвет) с учётом пользовательских папок
export const getProjectMeta = (
  id: string,
  folders: Folder[],
): { id: string; label: string; color: string } => {
  const standard = DEFAULT_PROJECTS.find((p) => p.id === id);
  if (standard) return standard;
  const custom = folders.find((f) => f.id === id);
  if (custom) return { id, label: custom.name, color: "#FFFFFF" };
  return { id, label: "Папка", color: "var(--color-text-muted)" };
};

// Просрочена ли задача (с учётом наличия конкретного времени дедлайна)
export const isTaskOverdue = (task: Task): boolean => {
  if (!task.deadline || task.completed) return false;
  const deadlineDate = new Date(task.deadline);

  if (hasSpecificTime(task.deadline)) {
    return deadlineDate.getTime() < new Date().getTime();
  }

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const deadlineStart = new Date(
    deadlineDate.getFullYear(),
    deadlineDate.getMonth(),
    deadlineDate.getDate(),
  ).getTime();
  return deadlineStart < todayStart;
};

export const PRIORITY_OPTIONS: DropdownOption[] = [
  { value: "low", label: "Низкий" },
  { value: "medium", label: "Средний" },
  { value: "high", label: "Срочно" },
];

export const REMINDER_OPTIONS: DropdownOption[] = [
  { value: "none", label: "Добавить напоминание..." },
  { value: "5", label: "За 5 минут" },
  { value: "15", label: "За 15 минут" },
  { value: "30", label: "За 30 минут" },
  { value: "60", label: "За 1 час" },
  { value: "180", label: "За 3 часа" },
  { value: "360", label: "За 6 часов" },
  { value: "720", label: "За 12 часов" },
  { value: "1440", label: "За 24 часа" },
  { value: "4320", label: "За 3 дня" },
  { value: "10080", label: "За 7 дней" },
  { value: "custom", label: "Свой выбор..." },
];
