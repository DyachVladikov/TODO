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
import { useSwipeActions } from "@/hooks/useSwipeActions";
import { triggerHaptic } from "@/utils/haptics";
import { hasSpecificTime, formatDeadlineTime } from "@/utils/date";
import { getPriorityMeta, getProjectMeta, isTaskOverdue } from "@/utils/task";
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

  const {
    itemRef,
    bgCompleteRef,
    bgDeleteRef,
    toastType,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useSwipeActions({ task, onToggleStatus, onDelete });

  const projectMeta = getProjectMeta(task.projectId, folders);
  const priorityMeta = getPriorityMeta(task.priority as Priority);

  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const showTime = hasSpecificTime(task.deadline);
  const deadlineTime = formatDeadlineTime(task.deadline);
  const hasTags = task.tags && task.tags.length > 0;
  const isOverdue = isTaskOverdue(task);

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

                {task.deadline && showTime && (
                  <div
                    className="task-badge"
                    style={{
                      color: isOverdue
                        ? "var(--color-status-error)"
                        : "#F97316",
                    }}
                  >
                    <Clock size={14} />
                    <span>{deadlineTime}</span>
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
