import {
  Check,
  Clock,
  Flag,
  Folder,
  Star,
  Trash2,
  AlignLeft,
  CheckSquare,
  Calendar,
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

  const getProjectMeta = (id: string) => {
    const defaultProjects = [
      { id: "work", label: "Работа", color: "#3B82F6" },
      { id: "home", label: "Дом", color: "#10B981" },
      { id: "ideas", label: "Идеи", color: "#8B5CF6" },
    ];

    const standard = defaultProjects.find((p) => p.id === id);
    if (standard) return standard;

    const custom = folders.find((f) => f.id === id);
    if (custom) return { id, label: custom.name, color: "#FFFFFF" };

    return { id, label: "Папка", color: "var(--color-text-muted)" };
  };

  const projectMeta = getProjectMeta(task.projectId);
  const priorityMeta = getPriorityMeta(task.priority as Priority);

  const formatDeadlineDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  const formatDeadlineTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasTags = task.tags && task.tags.length > 0;

  return (
    <div
      className={`task-item ${task.completed ? "task-item--completed" : ""}`}
      onClick={() => onClick(task)}
    >
      <div className="task-item__header">
        <button
          className={`task-item__checkbox ${task.completed ? "task-item__checkbox--active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus();
          }}
        >
          {task.completed && <Check size={16} />}
        </button>

        <div className="task-item__title-area">
          <span className="task-item__title">{task.title}</span>

          <div className="task-item__mini-badges">
            {task.important && (
              <Star
                size={16}
                color="var(--color-status-warning)"
                fill="var(--color-status-warning)"
              />
            )}

            <Clock size={16} style={{ opacity: task.deadline ? 1 : 0.4 }} />
            <Flag size={16} style={{ color: priorityMeta.color }} />
            <Folder size={16} style={{ color: projectMeta.color }} />
          </div>
        </div>

        <div className="task-item__actions">
          <button
            className={`task-item__btn ${task.important ? "task-item__btn--important" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleImportant();
            }}
            title="Отметить как важное"
          >
            <Star size={18} fill={task.important ? "currentColor" : "none"} />
          </button>
          <button
            className="task-item__btn task-item__btn--delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Удалить задачу"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="task-item__expanded">
        <div className="task-item__expanded-inner">
          <div className="task-item__full-badges">
            <div
              className="task-badge"
              style={{
                color: task.deadline ? "#06B6D4" : "var(--color-text-muted)",
              }}
            >
              <Calendar size={14} />
              <span>
                {task.deadline
                  ? formatDeadlineDate(task.deadline)
                  : "Бессрочно"}
              </span>
            </div>

            {task.deadline && (
              <div className="task-badge" style={{ color: "#F97316" }}>
                <Clock size={14} />
                <span>{formatDeadlineTime(task.deadline)}</span>
              </div>
            )}

            <div className="task-badge" style={{ color: priorityMeta.color }}>
              <Flag size={14} />
              <span>{priorityMeta.label}</span>
            </div>

            <div className="task-badge" style={{ color: projectMeta.color }}>
              <Folder size={14} />
              <span>{projectMeta.label}</span>
            </div>
          </div>

          {(task.notes || (task.checkList && task.checkList.length > 0)) && (
            <div className="task-item__notes-section">
              {task.notes && (
                <div className="note-line">
                  <AlignLeft size={16} />
                  <span>{task.notes}</span>
                </div>
              )}
              {task.checkList && task.checkList.length > 0 && (
                <div className="note-line">
                  <CheckSquare size={16} />
                  <span>
                    Чек-лист: {task.checkList.filter((i) => i.completed).length}{" "}
                    / {task.checkList.length}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="task-item__footer">
            <div className="task-item__tags">
              {hasTags ? (
                task.tags!.map((tag) => <span key={tag}>#{tag}</span>)
              ) : (
                <span className="task-item__placeholder-tag">#теги</span>
              )}
            </div>

            <div className="task-item__date">
              <Clock size={12} />
              <span>
                Создано: {new Date(task.createdAt).toLocaleDateString("ru-RU")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
