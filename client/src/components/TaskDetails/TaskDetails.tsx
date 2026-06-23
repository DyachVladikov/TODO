import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import type { Task, TaskPayload, Priority, CheckListItem } from "@/api/types";
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import "./TaskDetails.scss";

interface TaskDetailsProps {
  task: Task | null;
  onClose: () => void;
}

const TaskDetails = ({ task, onClose }: TaskDetailsProps) => {
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TaskPayload | null>(null);
  const [newCheckLinkTitle, setNewCheckLinkTitle] = useState("");
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Флаг для управления анимацией выезда
  const isOpen = Boolean(task);

  useEffect(() => {
    if (task) {
      setIsEditing(false);
      setDraft({
        title: task.title,
        notes: task.notes || "",
        priority: task.priority,
        deadline: task.deadline,
        projectId: task.projectId,
        tags: task.tags || [],
        checkList: task.checkList || [],
      });
      setNewCheckLinkTitle("");
    } else {
      setDraft(null);
      setIsEditing(false);
    }
  }, [task]);

  const updateDraft = (updates: Partial<TaskPayload>) => {
    setDraft((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const handleSave = () => {
    if (!draft || !task) return;
    updateTaskMutation.mutate(
      { id: task.id, updates: draft },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleCancel = () => {
    if (!task) return;
    setIsEditing(false);
    setDraft({
      title: task.title,
      notes: task.notes || "",
      priority: task.priority,
      deadline: task.deadline,
      projectId: task.projectId,
      tags: task.tags || [],
      checkList: task.checkList || [],
    });
  };

  const handleDeleteTask = () => {
    if (task && window.confirm("Вы уверены, что хотите удалить эту задачу?")) {
      deleteTaskMutation.mutate(task.id, {
        onSuccess: () => onClose(),
      });
    }
  };

  const toggleCheckListItem = (itemId: string) => {
    if (!isEditing || !draft) return;
    const updatedList = (draft.checkList || []).map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    );
    updateDraft({ checkList: updatedList });
  };

  const addCheckListItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckLinkTitle.trim() || !draft) return;

    const newItem: CheckListItem = {
      id: Date.now().toString(),
      title: newCheckLinkTitle.trim(),
      completed: false,
    };

    updateDraft({ checkList: [...(draft.checkList || []), newItem] });
    setNewCheckLinkTitle("");
  };

  const deleteCheckListItem = (itemId: string) => {
    if (!draft) return;
    const updatedList = (draft.checkList || []).filter(
      (item) => item.id !== itemId,
    );
    updateDraft({ checkList: updatedList });
  };

  const getPriorityMeta = (p: Priority) => {
    switch (p) {
      case "high":
        return { label: "Срочно", color: "var(--color-status-error)" };
      case "medium":
        return { label: "Средний", color: "var(--color-status-warning)" };
      default:
        return { label: "Низкий", color: "var(--color-status-success)" };
    }
  };

  const currentData = isEditing ? draft : task;

  return (
    <>
      {/* Темная подложка, закрывающая панель по клику мимо нее */}
      <div
        className={`task-details-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      />

      {/* Сама панель с классом 'open' для анимации */}
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
                    disabled={updateTaskMutation.isPending}
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
                          <option value="inbox">Входящие</option>
                          <option value="work">Работа</option>
                          <option value="home">Дом</option>
                        </select>
                      ) : (
                        <span>
                          {task.projectId === "work"
                            ? "Работа"
                            : task.projectId === "home"
                              ? "Дом"
                              : "Входящие"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`task-meta-item ${isEditing ? "task-meta-item--clickable" : ""}`}
                  >
                    <span className="task-meta-label">Дедлайн</span>
                    <div className="task-meta-value">
                      <Calendar size={14} />
                      {isEditing ? (
                        <input
                          type="date"
                          value={
                            draft.deadline ? draft.deadline.split("T")[0] : ""
                          }
                          onChange={(e) =>
                            updateDraft({ deadline: e.target.value })
                          }
                          className="task-meta-date-input"
                        />
                      ) : (
                        <span>
                          {task.deadline
                            ? new Date(task.deadline).toLocaleDateString()
                            : "Нет"}
                        </span>
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
                          <option value="low">Низкий</option>
                          <option value="medium">Средний</option>
                          <option value="high">Срочно</option>
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
                Создано: {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </footer>
          </>
        )}
      </aside>
    </>
  );
};

export default TaskDetails;
