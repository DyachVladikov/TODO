import { useRef, useState } from "react";
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

  const itemRef = useRef<HTMLDivElement>(null);
  const bgCompleteRef = useRef<HTMLDivElement>(null);
  const bgDeleteRef = useRef<HTMLDivElement>(null);

  const touchStartX = useRef<number | null>(null);
  const currentOffset = useRef<number>(0);
  const hasVibrated = useRef<boolean>(false);

  const [toastType, setToastType] = useState<"completed" | "deleted" | null>(
    null,
  );

  const triggerHaptic = (
    type: "light" | "medium" | "rigid" | "success" | "warning" | "error",
  ) => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    if (type === "success" || type === "error" || type === "warning") {
      tg.HapticFeedback?.notificationOccurred(type);
    } else {
      tg.HapticFeedback?.impactOccurred(type);
    }
  };

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

  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const hasSpecificTime = deadlineDate
    ? deadlineDate.getHours() !== 0 || deadlineDate.getMinutes() !== 0
    : false;
  const hasTags = task.tags && task.tags.length > 0;

  let isOverdue = false;
  if (deadlineDate && !task.completed) {
    if (hasSpecificTime) {
      isOverdue = deadlineDate.getTime() < new Date().getTime();
    } else {
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
      isOverdue = deadlineStart < todayStart;
    }
  }

  // --- ЛОГИКА СВАЙПОВ ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (toastType) return;

    touchStartX.current = e.touches[0].clientX;
    hasVibrated.current = false;

    if (itemRef.current) {
      itemRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const offset = e.touches[0].clientX - touchStartX.current;
    currentOffset.current = offset;

    const threshold = 100;
    const maxDrag = 130; // Жесткий ограничитель, чтобы карточка не улетала слишком далеко
    let visualOffset = offset;

    // ПОДЕРГИВАНИЕ: Если задача выполнена и мы тянем вправо
    if (task.completed && offset > 0) {
      visualOffset = offset * 0.15; // Очень тугое сопротивление
      visualOffset = Math.min(visualOffset, 25); // Запрещаем тянуть дальше 25px
    } else {
      // Обычная логика резинового сопротивления для остальных действий
      if (offset > threshold) {
        visualOffset = threshold + (offset - threshold) * 0.25;
      } else if (offset < -threshold) {
        visualOffset = -threshold + (offset + threshold) * 0.25;
      }
      // Ограничиваем максимальную оттяжку
      visualOffset = Math.max(-maxDrag, Math.min(maxDrag, visualOffset));
    }

    if (itemRef.current) {
      itemRef.current.style.transform = `translateX(${visualOffset}px)`;

      // Красим рамку только если это не подергивание
      if (!(task.completed && offset > 0)) {
        const ratio = Math.min(Math.abs(visualOffset) / threshold, 1);
        if (offset > 0) {
          itemRef.current.style.borderColor = `rgba(16, 185, 129, ${ratio})`;
        } else {
          itemRef.current.style.borderColor = `rgba(239, 68, 68, ${ratio})`;
        }
      }
    }

    // Управление непрозрачностью фонов
    if (offset > 0 && bgCompleteRef.current && bgDeleteRef.current) {
      if (task.completed) {
        // Убираем зеленый фон при подергивании выполненной задачи
        bgCompleteRef.current.style.opacity = "0";
      } else {
        bgCompleteRef.current.style.opacity = Math.min(
          offset / threshold,
          1,
        ).toString();
      }
      bgDeleteRef.current.style.opacity = "0";
    } else if (offset < 0 && bgCompleteRef.current && bgDeleteRef.current) {
      bgDeleteRef.current.style.opacity = Math.min(
        Math.abs(offset) / threshold,
        1,
      ).toString();
      bgCompleteRef.current.style.opacity = "0";
    }

    // Логика вибрации
    if (
      Math.abs(offset) >= threshold &&
      !hasVibrated.current &&
      !(task.completed && offset > 0)
    ) {
      triggerHaptic("light");
      hasVibrated.current = true;
    } else if (Math.abs(offset) < threshold && hasVibrated.current) {
      hasVibrated.current = false;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    touchStartX.current = null;

    const offset = currentOffset.current;
    const threshold = 100;

    if (itemRef.current) {
      itemRef.current.style.transition =
        "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.4s ease";
    }

    // Если это выполненная задача и свайп вправо — просто возвращаем обратно
    if (task.completed && offset > 0) {
      resetPosition();
      return;
    }

    if (offset >= threshold) {
      // ВЫПОЛНЕНИЕ
      triggerHaptic("success");
      setToastType("completed");

      // Плавно скрываем зеленую подложку (по аналогии с красной ниже)
      if (bgCompleteRef.current) {
        bgCompleteRef.current.style.transition = "opacity 0.3s ease";
        bgCompleteRef.current.style.opacity = "0";
      }

      resetPosition(); // Возвращаем карточку плавно

      setTimeout(() => {
        setToastType(null);
        onToggleStatus();
      }, 800);
    } else if (offset <= -threshold) {
      // УДАЛЕНИЕ
      triggerHaptic("warning");
      setToastType("deleted");

      // === ДОБАВЛЕНО: Скрываем красную подложку плавно ===
      if (bgDeleteRef.current) {
        bgDeleteRef.current.style.transition = "opacity 0.3s ease";
        bgDeleteRef.current.style.opacity = "0";
      }

      // Улетает за экран карточка задачи
      if (itemRef.current) {
        itemRef.current.style.transform = `translateX(-150vw)`;
        itemRef.current.style.borderColor = `rgba(239, 68, 68, 1)`;
      }

      setTimeout(() => {
        setToastType(null);
        onDelete();
      }, 800);
    } else {
      resetPosition();
    }
  };

  const resetPosition = () => {
    currentOffset.current = 0;
    if (itemRef.current) {
      itemRef.current.style.transform = `translateX(0px)`;
      itemRef.current.style.borderColor = "";
    }

    if (bgCompleteRef.current) {
      bgCompleteRef.current.style.transition = "opacity 0.3s ease";
      bgCompleteRef.current.style.opacity = "0";
      setTimeout(() => {
        if (bgCompleteRef.current)
          bgCompleteRef.current.style.transition = "none";
      }, 300);
    }
    if (bgDeleteRef.current) {
      bgDeleteRef.current.style.transition = "opacity 0.3s ease";
      bgDeleteRef.current.style.opacity = "0";
      setTimeout(() => {
        if (bgDeleteRef.current) bgDeleteRef.current.style.transition = "none";
      }, 300);
    }
  };

  return (
    <>
      {toastType && (
        <div className="task-action-toast">
          <div className="task-action-toast__content">
            {toastType === "completed" ? (
              <>
                <div className="task-action-toast__icon task-action-toast__icon--success">
                  <Check size={48} />
                </div>
                <span>Выполнено!</span>
              </>
            ) : (
              <>
                <div className="task-action-toast__icon task-action-toast__icon--danger">
                  <Trash2 size={48} />
                </div>
                <span>Удалено</span>
              </>
            )}
          </div>
        </div>
      )}

      <div
        className="task-item-wrapper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ pointerEvents: toastType ? "none" : "auto" }}
      >
        <div
          className="task-item-swipe-bg task-item-swipe-bg--complete"
          ref={bgCompleteRef}
        >
          <Check size={20} />
        </div>
        <div
          className="task-item-swipe-bg task-item-swipe-bg--delete"
          ref={bgDeleteRef}
        >
          <Trash2 size={20} />
        </div>

        <div
          ref={itemRef}
          className={`task-item ${task.completed ? "task-item--completed" : ""}`}
          onClick={() => onClick(task)}
        >
          <div className="task-item__header">
            <button
              className={`task-item__checkbox ${task.completed ? "task-item__checkbox--active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic("light");
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
                <Clock
                  size={16}
                  style={{
                    opacity: task.deadline ? 1 : 0.4,
                    color: isOverdue ? "var(--color-status-error)" : "inherit",
                  }}
                />
                <Flag size={16} style={{ color: priorityMeta.color }} />
                <Folder size={16} style={{ color: projectMeta.color }} />
              </div>
            </div>

            <div className="task-item__actions">
              <button
                className={`task-item__btn ${task.important ? "task-item__btn--important" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic("light");
                  onToggleImportant();
                }}
              >
                <Star
                  size={18}
                  fill={task.important ? "currentColor" : "none"}
                />
              </button>
              <button
                className="task-item__btn task-item__btn--delete"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic("medium");
                  onDelete();
                }}
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
                    color: isOverdue
                      ? "var(--color-status-error)"
                      : task.deadline
                        ? "#06B6D4"
                        : "var(--color-text-muted)",
                  }}
                >
                  <Calendar size={14} />
                  <span>
                    {task.deadline
                      ? deadlineDate?.toLocaleDateString("ru-RU")
                      : "Бессрочно"}
                  </span>
                </div>

                {task.deadline && hasSpecificTime && (
                  <div
                    className="task-badge"
                    style={{
                      color: isOverdue
                        ? "var(--color-status-error)"
                        : "#F97316",
                    }}
                  >
                    <Clock size={14} />
                    <span>
                      {deadlineDate?.toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}

                <div
                  className="task-badge"
                  style={{ color: priorityMeta.color }}
                >
                  <Flag size={14} />
                  <span>{priorityMeta.label}</span>
                </div>

                <div
                  className="task-badge"
                  style={{ color: projectMeta.color }}
                >
                  <Folder size={14} />
                  <span>{projectMeta.label}</span>
                </div>
              </div>

              {(task.notes ||
                (task.checkList && task.checkList.length > 0)) && (
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
                        Чек-лист:{" "}
                        {task.checkList.filter((i) => i.completed).length} /{" "}
                        {task.checkList.length}
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
                    Создано:{" "}
                    {new Date(task.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskItem;
