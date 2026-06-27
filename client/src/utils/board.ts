import type { Task, Folder } from "@/api/types";
import type { DropdownOption } from "@/components/CustomDropdown";
import { isToday, isWithinNextWeek } from "@/utils/date";

export const BOARD_BASE_PROJECT_OPTIONS: DropdownOption[] = [
  { value: "all", label: "Все папки" },
  { value: "work", label: "Работа" },
  { value: "home", label: "Дом" },
  { value: "ideas", label: "Идеи" },
];

export const BOARD_PRIORITY_OPTIONS: DropdownOption[] = [
  { value: "all", label: "Любой Приоритет" },
  { value: "low", label: "Низкий" },
  { value: "medium", label: "Средний" },
  { value: "high", label: "Срочный" },
];

export const BOARD_SORT_OPTIONS: DropdownOption[] = [
  { value: "newest", label: "Сначала новые" },
  { value: "deadline_asc", label: "Ближайшие дедлайны" },
  { value: "deadline_desc", label: "Дальние дедлайны" },
];

const DEFAULT_FILTER_TITLES: Record<string, string> = {
  all: "Все задачи",
  completed: "Завершённые",
  important: "Важные",
  today: "Сегодня",
  weekly: "Ближайшие 7 дней",
  work: "Работа",
  home: "Дом",
  ideas: "Идеи",
};

export const getBoardTitle = (activeFilter: string, folders: Folder[]) => {
  if (DEFAULT_FILTER_TITLES[activeFilter]) {
    return DEFAULT_FILTER_TITLES[activeFilter];
  }
  const customFolder = folders.find((f) => f.id === activeFilter);
  return customFolder ? customFolder.name : "Все задачи";
};

// Проверка соответствия задачи фильтру из сайдбара (вкладке)
const matchesSidebarFilter = (task: Task, activeFilter: string): boolean => {
  switch (activeFilter) {
    case "all":
      return true;
    case "completed":
      return task.completed;
    case "important":
      return task.important;
    case "today":
      return isToday(task.deadline);
    case "weekly":
      return isWithinNextWeek(task.deadline);
    default:
      return task.projectId === activeFilter;
  }
};

export interface TaskBoardFilters {
  activeFilter: string;
  searchQuery: string;
  filterProject: string;
  filterPriority: string;
  filterTag: string;
}

export const filterTasks = (
  tasks: Task[],
  {
    activeFilter,
    searchQuery,
    filterProject,
    filterPriority,
    filterTag,
  }: TaskBoardFilters,
): Task[] =>
  tasks.filter((task) => {
    if (!matchesSidebarFilter(task, activeFilter)) return false;

    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (filterProject !== "all" && task.projectId !== filterProject)
      return false;
    if (filterPriority !== "all" && task.priority !== filterPriority)
      return false;

    if (filterTag) {
      const safeTags = task.tags || [];
      const hasTag = safeTags.some((tag) =>
        tag.toLowerCase().includes(filterTag.toLowerCase()),
      );
      if (!hasTag) return false;
    }

    return true;
  });

export const sortTasks = (tasks: Task[], sortBy: string): Task[] =>
  [...tasks].sort((a, b) => {
    // Выполненные задачи всегда падают вниз
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Логика сортировки по датам
    if (sortBy === "deadline_asc" || sortBy === "deadline_desc") {
      // Задачи без дедлайна кидаем в самый конец списка при сортировке по дате
      if (!a.deadline && !b.deadline) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;

      const timeA = new Date(a.deadline).getTime();
      const timeB = new Date(b.deadline).getTime();

      return sortBy === "deadline_asc" ? timeA - timeB : timeB - timeA;
    }

    // Дефолт: Сначала новые (по дате добавления)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
