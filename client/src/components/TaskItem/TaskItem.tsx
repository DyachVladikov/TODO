import {
  Check,
  Clock,
  Flag,
  Folder,
  Star,
  Trash2,
  AlignLeft,
  CheckSquare,
} from "lucide-react";
import type { Task, Priority } from "@/api/types";
import { useFolders } from "@/hooks/useFolders";
import "./TaskItem.scss";

interface TaskItemProps {
  task: Task;
  onToggleStatus: () => void;
  onToggleImportant: () => void;
  onDelete: () => void;
  onClick: (task: Task) => void;
}

const TaskItem = ({
  task,
  onToggleStatus,
  onToggleImportant,
  onDelete,
  onClick,
}: TaskItemProps) => {
  const { folders } = useFolders();

  const getPriorityMeta = (p: Priority) => {
    if (p === "high")
      return { label: "Срочно", color: "var(--color-status-error)" };
    if (p === "medium")
      return { label: "Средний", color: "var(--color-status-warning)" };
    return { label: "Низкий", color: "var(--color-status-success)" };
  };

  // Вся логика папок и цветов внутри компонента, как в Sidebar
  const getProjectMeta = (id: string) => {
    const defaultProjects = [
      { id: "inbox", label: "Входящие", color: "var(--color-text-muted)" },
      { id: "work", label: "Работа", color: "#3B82F6" },
      { id: "home", label: "Дом", color: "#10B981" },
      { id: "ideas", label: "Идеи", color: "#8B5CF6" },
    ];

    const standard = defaultProjects.find((p) => p.id === id);
    if (standard) return standard;

    const custom = folders.find((f) => f.id === id);
    if (custom) return { id, label: custom.name, color: "#FFFFFF" }; // Кастомные папки белые

    return { id, label: "Папка", color: "var(--color-text-muted)" };
  };

  const projectMeta = getProjectMeta(task.projectId);

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  return (
    <div
      className={`task-item ${task.completed ? "task-item--completed" : ""}`}
      onClick={() => onClick(task)}
    >
      {/* ЛЕВАЯ ЧАСТЬ: Чекбокс */}
      <button
        className={`task-item__checkbox ${task.completed ? "task-item__checkbox--active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus();
        }}
      >
        {task.completed && <Check size={16} />}
      </button>

      {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: Контент */}
      <div className="task-item__content">
        {/* === СОСТОЯНИЕ ПО УМОЛЧАНИЮ (Свернуто, минимализм) === */}
        <div className="task-item__view-compact">
          <span className="task-item__title">{task.title}</span>
          <div className="task-item__mini-badges">
            {task.deadline && <Clock size={16} />}
            <Flag
              size={16}
              style={{
                color: getPriorityMeta(task.priority as Priority).color,
              }}
            />
            <Folder size={16} style={{ color: projectMeta.color }} />
          </div>
        </div>

        {/* === СОСТОЯНИЕ ПРИ НАВЕДЕНИИ (Animated Sequence) === */}
        <div className="task-item__view-expanded">
          <span className="task-item__title task-item__title--animated">
            {task.title}
          </span>

          <div className="task-item__view-details">
            <div className="task-item__center-badges">
              {task.deadline && (
                <div
                  className="task-badge deadline"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <Clock size={12} />
                  <span>{formatDeadline(task.deadline)}</span>
                </div>
              )}
              <div
                className="task-badge priority"
                style={{
                  color: getPriorityMeta(task.priority as Priority).color,
                }}
              >
                <Flag size={12} />
                <span>{getPriorityMeta(task.priority as Priority).label}</span>
              </div>
              <div
                className="task-badge folder"
                style={{ color: projectMeta.color }}
              >
                <Folder size={12} />
                <span>{projectMeta.label}</span>
              </div>
            </div>

            {(task.notes ||
              (task.tags && task.tags.length > 0) ||
              (task.checkList && task.checkList.length > 0)) && (
              <div className="task-item__notes-container">
                {task.notes && (
                  <div className="task-item__note-line">
                    <AlignLeft size={14} />
                    <span>{task.notes}</span>
                  </div>
                )}
                {task.checkList && task.checkList.length > 0 && (
                  <div className="task-item__note-line">
                    <CheckSquare size={14} />
                    <span>
                      Чек-лист:{" "}
                      {task.checkList.filter((i) => i.completed).length} /{" "}
                      {task.checkList.length}
                    </span>
                  </div>
                )}
                <div className="task-item__tags">
                  {task.tags?.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: Действия (Появляются при наведении) */}
      <div className="task-item__actions">
        <button
          className={`task-item__btn ${task.important ? "task-item__btn--important" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleImportant();
          }}
          title="Отметить как важное"
        >
          <Star size={16} fill={task.important ? "currentColor" : "none"} />
        </button>
        <button
          className="task-item__btn task-item__btn--delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Удалить задачу"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
