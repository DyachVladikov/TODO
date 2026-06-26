import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Folder,
  Tag,
  Flag,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import TaskItem from "./../TaskItem";
import type { Task } from "@/api/types";
import { useFolders } from "@/hooks/useFolders";
import "./TaskBoard.scss";

const CustomDropdown = ({ icon, value, options, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o: any) => o.value === value);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <select
        className="custom-dropdown__native"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(false);
        }}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        className={`custom-dropdown__toggle ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {icon}
        <span className="custom-dropdown__label">{selectedOption?.label}</span>
        <ChevronDown size={14} className="icon-chevron" />
      </button>

      {isOpen && (
        <div className="custom-dropdown__menu">
          {options.map((opt: any) => (
            <button
              key={opt.value}
              type="button"
              className={`custom-dropdown__item ${opt.value === value ? "selected" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface TaskBoardProps {
  activeFilter: string;
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onOpenModal: () => void;
}

const TaskBoard = ({
  activeFilter,
  tasks,
  onUpdateTask,
  onDeleteTask,
  onSelectTask,
  onOpenModal,
}: TaskBoardProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterTag, setFilterTag] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const { folders } = useFolders();

  const projectOptions = [
    { value: "all", label: "Все папки" },
    { value: "work", label: "Работа" },
    { value: "home", label: "Дом" },
    { value: "ideas", label: "Идеи" },
    ...folders.map((f) => ({ value: f.id, label: f.name })),
  ];

  const priorityOptions = [
    { value: "all", label: "Любой Приоритет" },
    { value: "low", label: "Низкий" },
    { value: "medium", label: "Средний" },
    { value: "high", label: "Срочный" },
  ];

  const sortOptions = [
    { value: "newest", label: "Сначала новые" },
    { value: "deadline_asc", label: "Ближайшие дедлайны" },
    { value: "deadline_desc", label: "Дальние дедлайны" },
  ];

  const filteredTasks = tasks.filter((task) => {
    let passSidebar = false;

    if (activeFilter === "all") {
      passSidebar = true;
    } else if (activeFilter === "completed") {
      passSidebar = task.completed;
    } else if (activeFilter === "important") {
      passSidebar = task.important;
    } else if (activeFilter === "today") {
      if (task.deadline) {
        const today = new Date();
        const taskDate = new Date(task.deadline);
        passSidebar =
          taskDate.getDate() === today.getDate() &&
          taskDate.getMonth() === today.getMonth() &&
          taskDate.getFullYear() === today.getFullYear();
      }
    } else if (activeFilter === "weekly") {
      if (task.deadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);
        const taskDate = new Date(task.deadline);
        passSidebar = taskDate >= today && taskDate <= nextWeek;
      }
    } else {
      passSidebar = task.projectId === activeFilter;
    }

    if (!passSidebar) return false;

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

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Выполненные задачи всегда падают вниз
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Логика сортировки по датам
    if (sortBy === "deadline_asc" || sortBy === "deadline_desc") {
      // Задачи без дедлайна кидаем в самый конец списка при сортировке по дате
      if (!a.deadline && !b.deadline) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
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

  const getBoardTitle = () => {
    if (activeFilter === "all") return "Все задачи";
    if (activeFilter === "completed") return "Завершённые";
    if (activeFilter === "important") return "Важные";
    if (activeFilter === "today") return "Сегодня";
    if (activeFilter === "weekly") return "Ближайшие 7 дней";
    if (activeFilter === "work") return "Работа";
    if (activeFilter === "home") return "Дом";
    if (activeFilter === "ideas") return "Идеи";

    const customFolder = folders.find((f) => f.id === activeFilter);
    if (customFolder) return customFolder.name;

    return "Все задачи";
  };

  return (
    <main className="task-board">
      <div className="task-board__header">
        <div className="task-board__header-title">
          <h2>{getBoardTitle()}</h2>
          <span className="task-board__count">{sortedTasks.length} задач</span>
        </div>

        <button className="task-board__add-btn" onClick={onOpenModal}>
          <Plus size={18} />
          <span>Создать задачу</span>
        </button>
      </div>

      <div className="task-board__filters">
        <div className="filter-input-group filter-input-group--search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <CustomDropdown
          icon={<Folder size={16} />}
          options={projectOptions}
          value={filterProject}
          onChange={setFilterProject}
        />

        <CustomDropdown
          icon={<Flag size={16} />}
          options={priorityOptions}
          value={filterPriority}
          onChange={setFilterPriority}
        />

        <CustomDropdown
          icon={<ArrowUpDown size={16} />}
          options={sortOptions}
          value={sortBy}
          onChange={setSortBy}
        />

        <div className="filter-input-group filter-input-group--tag">
          <Tag size={16} />
          <input
            type="text"
            placeholder="Тег..."
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          />
        </div>
      </div>

      <div className="task-board__list">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleStatus={() =>
                onUpdateTask(task.id, { completed: !task.completed })
              }
              onToggleImportant={() =>
                onUpdateTask(task.id, { important: !task.important })
              }
              onDelete={() => onDeleteTask(task.id)}
              onClick={onSelectTask}
            />
          ))
        ) : (
          <div className="task-board__empty">
            <p>Ничего не найдено.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default TaskBoard;
