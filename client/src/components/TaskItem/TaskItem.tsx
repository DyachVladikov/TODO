import {
  Check,
  Star,
  Trash2,
  Flag,
  Clock,
  AlignLeft,
  Timer,
  Infinity as InfinityIcon,
  Folder,
  Calendar,
} from "lucide-react";
import type { Task } from "@/api/types";
import "./TaskItem.scss";

interface TaskItemProps {
  task: Task;
  onToggleStatus: (id: string) => void;
  onToggleImportant: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (task: Task) => void;
}

const TaskItem = ({
  task,
  onToggleStatus,
  onToggleImportant,
  onDelete,
  onClick,
}: TaskItemProps) => {
  const getPriorityMeta = (priority?: string) => {
    switch (priority) {
      case "high":
        return { label: "Срочно", color: "var(--color-status-error)" };
      case "medium":
        return { label: "Средний", color: "var(--color-status-warning)" };
      case "low":
        return { label: "Низкий", color: "var(--color-status-success)" };
      default:
        return { label: "Обычный", color: "var(--color-text-muted)" };
    }
  };

  const getProjectMeta = (projectId?: string) => {
    switch (projectId) {
      case "work":
        return { label: "Работа", color: "#3B82F6" };
      case "home":
        return { label: "Дом", color: "#10B981" };
      default:
        return { label: "Входящие", color: "#8B5CF6" };
    }
  };

  const getDeadlineMeta = (deadline?: string) => {
    if (!deadline)
      return {
        short: <InfinityIcon size={14} />,
        full: "Без дедлайна",
        color: "var(--color-text-muted)",
      };

    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    const fullDate = new Date(deadline).toLocaleDateString();

    if (days < 0)
      return {
        short: `${Math.abs(days)} д назад`,
        full: fullDate,
        color: "var(--color-status-error)",
      };
    if (days === 0)
      return {
        short: "Сегодня",
        full: fullDate,
        color: "var(--color-status-warning)",
      };
    return {
      short: `${days} д`,
      full: fullDate,
      color: "var(--color-text-secondary)",
    };
  };

  const priorityMeta = getPriorityMeta(task.priority);
  const projectMeta = getProjectMeta(task.projectId);
  const deadlineMeta = getDeadlineMeta(task.deadline);
  const safeTags = task.tags || [];

  return (
    <div
      className={`task-item ${task.completed ? "task-item--completed" : ""}`}
      onClick={() => onClick(task)}
    >
      <div className="task-item__main">
        <button
          className={`task-item__checkbox ${task.completed ? "task-item__checkbox--active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(task.id);
          }}
        >
          {task.completed && <Check size={14} />}
        </button>

        <div className="task-item__content">
          <div className="task-item__standard-layout">
            <span className="task-item__title">{task.title}</span>
            <div className="task-item__badges task-item__badges--compact">
              <div
                className="task-item__badge"
                style={{ color: deadlineMeta.color }}
              >
                <Timer size={14} />
                <span>{deadlineMeta.short}</span>
              </div>
              {task.priority && (
                <div
                  className="task-item__badge"
                  style={{ color: priorityMeta.color }}
                >
                  <Flag size={14} />
                </div>
              )}
              {task.projectId && (
                <div
                  className="task-item__badge"
                  style={{ color: projectMeta.color }}
                >
                  <Folder size={14} />
                </div>
              )}
            </div>
          </div>

          <div className="task-item__hover-layout">
            <span className="task-item__title task-item__title--hover">
              {task.title}
            </span>

            <div className="task-item__badges task-item__badges--hover">
              <div
                className="task-item__badge"
                style={{ color: deadlineMeta.color }}
              >
                <Calendar size={14} />
                <span>{deadlineMeta.full}</span>
              </div>

              {task.priority && (
                <div
                  className="task-item__badge"
                  style={{ color: priorityMeta.color }}
                >
                  <Flag size={14} />
                  <span>{priorityMeta.label}</span>
                </div>
              )}

              {task.projectId && (
                <div
                  className="task-item__badge"
                  style={{ color: projectMeta.color }}
                >
                  <Folder size={14} />
                  <span>{projectMeta.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="task-item__actions">
          <button
            className={`task-item__btn ${task.important ? "task-item__btn--important" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleImportant(task.id);
            }}
          >
            <Star size={18} fill={task.important ? "currentColor" : "none"} />
          </button>
          <button
            className="task-item__btn task-item__btn--delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="task-item__expanded">
        <div className="task-item__expanded-content">
          {task.notes && (
            <p className="task-item__notes">
              <AlignLeft size={14} />
              {task.notes}
            </p>
          )}

          <div className="task-item__expanded-footer">
            {/* Невидимые теги в левом нижнем углу */}
            {safeTags.length > 0 && (
              <div className="task-item__bottom-tags">
                {safeTags.map((tag) => (
                  <span key={tag} className="task-item__bottom-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <span className="task-item__created">
              <Clock size={12} />
              Создано: {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
