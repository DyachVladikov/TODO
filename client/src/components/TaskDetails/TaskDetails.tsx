import { useRef } from "react";
import {
  X,
  Calendar,
  Flag,
  Folder,
  AlignLeft,
  Clock,
  Trash2,
  Tag,
  Plus,
  CheckSquare,
  Square,
  Save,
  Edit2,
  Bell,
} from "lucide-react";
import type { Task, Priority } from "@/api/types";
import ModalDropdown from "@/components/ModalDropdown";
import CustomReminderModal from "@/components/CustomReminderModal";
import { useTaskDetails } from "@/hooks/useTaskDetails";
import { formatDateTime } from "@/utils/date";
import {
  getPriorityMeta,
  getProjectLabel,
  formatReminderLabel,
  PROJECT_OPTIONS,
  PRIORITY_OPTIONS,
  REMINDER_OPTIONS,
} from "@/utils/task";
import "./TaskDetails.scss";

interface TaskDetailsProps {
  task: Task | null;
  onClose: () => void;
}

const TaskDetails = ({ task, onClose }: TaskDetailsProps) => {
  const {
    isEditing,
    setIsEditing,
    draft,
    dateDraft,
    setDateDraft,
    timeDraft,
    setTimeDraft,
    remindersDraft,
    isCustomReminderOpen,
    setIsCustomReminderOpen,
    newCheckLinkTitle,
    setNewCheckLinkTitle,
    currentData,
    isSaving,
    updateDraft,
    handleAddReminder,
    handleCustomReminderSave,
    handleRemoveReminder,
    handleSave,
    handleCancel,
    handleDeleteTask,
    toggleCheckListItem,
    addCheckListItem,
    deleteCheckListItem,
  } = useTaskDetails(task, onClose);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const isOpen = Boolean(task);

  return (
    <>
      <div
        className={`task-details-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      />

      <aside
        className={`task-details ${isOpen ? "open" : ""} ${!task || !draft ? "task-details--empty" : ""}`}
      >
        {!task || !draft ? (
          <div className="task-details__empty-state">
            <span>Выберите задачу</span>
          </div>
        ) : (
          <>
            <header className="task-details__header">
              <button
                className="task-details__btn-icon task-details__btn-icon--delete"
                onClick={handleDeleteTask}
              >
                <Trash2 size={18} />
              </button>

              {isEditing ? (
                <>
                  <button
                    className="task-details__btn-text task-details__btn-text--reset"
                    onClick={handleCancel}
                  >
                    Отмена
                  </button>
                  <button
                    className="task-details__btn-text task-details__btn-text--save"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save size={16} />
                    Сохранить
                  </button>
                </>
              ) : (
                <button
                  className="task-details__btn-text"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={16} />
                  Изменить
                </button>
              )}

              <div className="task-details__divider" />

              <button className="task-details__btn-icon" onClick={onClose}>
                <X size={20} />
              </button>
            </header>

            <div className="task-details__content">
              <div className="task-details__section task-details__section--title">
                {isEditing ? (
                  <textarea
                    ref={titleRef}
                    className="task-details__title-input"
                    value={draft.title}
                    onChange={(e) => updateDraft({ title: e.target.value })}
                    placeholder="Название задачи..."
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = target.scrollHeight + "px";
                    }}
                  />
                ) : (
                  <h2 className="task-details__title-display">{task.title}</h2>
                )}
              </div>

              <div className="task-details__section task-details__section--meta">
                <div className="task-meta-grid">
                  <div className="task-meta-item">
                    <span className="task-meta-label">Статус</span>
                    <div
                      className={`task-status-badge ${task.completed ? "completed" : "active"}`}
                    >
                      {task.completed ? "Завершена" : "В работе"}
                    </div>
                  </div>

                  <div
                    className={`task-meta-item ${isEditing ? "task-meta-item--clickable" : ""}`}
                  >
                    <span className="task-meta-label">Проект</span>
                    <div className="task-meta-value">
                      <Folder size={14} className="icon-project" />
                      {isEditing ? (
                        <select
                          value={draft.projectId}
                          onChange={(e) =>
                            updateDraft({ projectId: e.target.value })
                          }
                          className="task-meta-select"
                        >
                          {PROJECT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>{getProjectLabel(task.projectId)}</span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`task-meta-item ${isEditing ? "task-meta-item--clickable" : ""}`}
                  >
                    <span className="task-meta-label">Дата</span>
                    <div className="task-meta-value">
                      <Calendar size={14} />
                      {isEditing ? (
                        <input
                          type="date"
                          value={dateDraft}
                          onChange={(e) => setDateDraft(e.target.value)}
                          className="task-meta-date-input"
                        />
                      ) : (
                        <span>
                          {dateDraft
                            ? new Date(dateDraft).toLocaleDateString()
                            : "Нет"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`task-meta-item ${isEditing ? "task-meta-item--clickable" : ""}`}
                  >
                    <span className="task-meta-label">Время</span>
                    <div className="task-meta-value">
                      <Clock size={14} />
                      {isEditing ? (
                        <input
                          type="time"
                          value={timeDraft}
                          onChange={(e) => setTimeDraft(e.target.value)}
                          className="task-meta-date-input"
                          disabled={!dateDraft}
                        />
                      ) : (
                        <span>{timeDraft || "Нет"}</span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`task-meta-item ${isEditing ? "task-meta-item--clickable" : ""}`}
                  >
                    <span className="task-meta-label">Приоритет</span>
                    <div
                      className="task-meta-value"
                      style={{
                        color: getPriorityMeta(
                          currentData?.priority as Priority,
                        ).color,
                      }}
                    >
                      <Flag size={14} />
                      {isEditing ? (
                        <select
                          value={draft.priority}
                          onChange={(e) =>
                            updateDraft({
                              priority: e.target.value as Priority,
                            })
                          }
                          className="task-meta-select"
                        >
                          {PRIORITY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>{getPriorityMeta(task.priority).label}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="task-details__section">
                <div className="task-details__section-header">
                  <Bell size={16} />
                  <h3>Напоминания</h3>
                </div>

                <div
                  className="task-tags-list"
                  style={{ marginBottom: isEditing ? "10px" : "0" }}
                >
                  {!isEditing && remindersDraft.length === 0 && (
                    <span className="task-details__empty-text">
                      Нет напоминаний
                    </span>
                  )}
                  {remindersDraft.map((minutes) => (
                    <span
                      key={minutes}
                      className="task-tag"
                      style={{ background: "var(--color-surface-2)" }}
                    >
                      <Bell
                        size={12}
                        style={{
                          marginRight: "4px",
                          color: "var(--color-accent-primary)",
                        }}
                      />
                      {formatReminderLabel(minutes)}
                      {isEditing && (
                        <button onClick={() => handleRemoveReminder(minutes)}>
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {isEditing && (
                  <ModalDropdown
                    icon={
                      <Bell
                        size={16}
                        style={{ color: "var(--color-text-muted)" }}
                      />
                    }
                    options={REMINDER_OPTIONS}
                    value={"none"}
                    onChange={handleAddReminder}
                    disabled={!dateDraft}
                  />
                )}
              </div>

              <div className="task-details__section">
                <div className="task-details__section-header">
                  <Tag size={16} />
                  <h3>Теги</h3>
                </div>
                <div className="task-tags-list">
                  {(currentData?.tags || []).length === 0 && !isEditing && (
                    <span className="task-details__empty-text">Нет тегов</span>
                  )}
                  {(currentData?.tags || []).map((tag) => (
                    <span key={tag} className="task-tag">
                      {tag}
                      {isEditing && (
                        <button
                          onClick={() =>
                            updateDraft({
                              tags: (draft.tags || []).filter((t) => t !== tag),
                            })
                          }
                        >
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                  {isEditing && (
                    <button
                      className="task-tag-add"
                      onClick={() => {
                        const newTag = prompt("Введите новый тег");
                        if (newTag)
                          updateDraft({
                            tags: [...(draft.tags || []), newTag],
                          });
                      }}
                    >
                      <Plus size={14} />
                      Добавить
                    </button>
                  )}
                </div>
              </div>

              <div className="task-details__section">
                <div className="task-details__section-header">
                  <AlignLeft size={16} />
                  <h3>Описание</h3>
                </div>
                {isEditing ? (
                  <textarea
                    className="task-details__notes-input"
                    placeholder="Добавить описание или заметки..."
                    value={draft.notes}
                    onChange={(e) => updateDraft({ notes: e.target.value })}
                  />
                ) : (
                  <div className="task-details__notes-display">
                    {task.notes ? (
                      task.notes
                    ) : (
                      <span className="task-details__empty-text">
                        Нет описания
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="task-details__section task-details__section--checklist">
                <div className="task-details__section-header">
                  <CheckSquare size={16} />
                  <h3>Чек-лист</h3>
                  <span className="task-checklist-count">
                    {
                      (currentData?.checkList || []).filter((i) => i.completed)
                        .length
                    }{" "}
                    / {(currentData?.checkList || []).length}
                  </span>
                </div>

                <div className="task-checklist-items">
                  {(currentData?.checkList || []).length === 0 &&
                    !isEditing && (
                      <span className="task-details__empty-text">
                        Чек-лист пуст
                      </span>
                    )}
                  {(currentData?.checkList || []).map((item) => (
                    <div
                      key={item.id}
                      className={`task-checklist-item ${item.completed ? "completed" : ""}`}
                    >
                      <button
                        className="item-checkbox"
                        onClick={() => toggleCheckListItem(item.id)}
                        disabled={!isEditing}
                      >
                        {item.completed ? (
                          <CheckSquare size={18} className="icon-checked" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                      <span className="item-title">{item.title}</span>
                      {isEditing && (
                        <button
                          className="item-delete"
                          onClick={() => deleteCheckListItem(item.id)}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <form
                    className="task-checklist-add"
                    onSubmit={addCheckListItem}
                  >
                    <Plus size={18} />
                    <input
                      type="text"
                      placeholder="Добавить пункт..."
                      value={newCheckLinkTitle}
                      onChange={(e) => setNewCheckLinkTitle(e.target.value)}
                    />
                    {newCheckLinkTitle && (
                      <button type="submit">Добавить</button>
                    )}
                  </form>
                )}
              </div>
            </div>

            <footer className="task-details__footer">
              <div className="task-date">
                <Clock size={12} />
                Создано: {formatDateTime(task.createdAt)}
              </div>
            </footer>
          </>
        )}
      </aside>

      {isCustomReminderOpen && (
        <CustomReminderModal
          onClose={() => setIsCustomReminderOpen(false)}
          onSave={handleCustomReminderSave}
        />
      )}
    </>
  );
};

export default TaskDetails;
