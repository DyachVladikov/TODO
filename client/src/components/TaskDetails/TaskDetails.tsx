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
  Bell,
  ChevronDown,
} from "lucide-react";
import type { Task, TaskPayload, Priority, CheckListItem } from "@/api/types";
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import "./TaskDetails.scss";

const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return "Нет";
  const date = new Date(dateString);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateOnly = (dateString: string | undefined | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTimeOnly = (dateString: string | undefined | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatReminderLabel = (minutes: number) => {
  if (minutes < 60) return `За ${minutes} мин.`;
  if (minutes < 1440) return `За ${minutes / 60} ч.`;
  return `За ${minutes / 1440} дн.`;
};

interface CustomReminderModalProps {
  onClose: () => void;
  onSave: (minutes: number) => void;
}

const CustomReminderModal = ({ onClose, onSave }: CustomReminderModalProps) => {
  const [amount, setAmount] = useState<number | string>(10);
  const [unit, setUnit] = useState<string>("minutes");

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (numAmount <= 0) return;

    let minutes = numAmount;
    if (unit === "hours") minutes = numAmount * 60;
    if (unit === "days") minutes = numAmount * 1440;

    onSave(minutes);
    onClose();
  };

  const unitOptions = [
    { value: "minutes", label: "Минут" },
    { value: "hours", label: "Часов" },
    { value: "days", label: "Дней" },
  ];

  return (
    <div className="modal-overlay modal-overlay--nested" onClick={onClose}>
      <div
        className="modal-content modal-content--small"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header compact-header">
          <div className="compact-header-title">
            <Bell size={18} className="header-icon" />
            <h3>Точное напоминание</h3>
          </div>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>
        <form onSubmit={handleConfirm} className="modal-form">
          <div
            className="form-row"
            style={{ gap: "10px", marginBottom: "20px" }}
          >
            <div className="form-group" style={{ flex: 1 }}>
              <input
                type="number"
                className="form-input custom-number-input"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group" style={{ flex: 1.5 }}>
              <ModalDropdown
                icon={
                  <Clock
                    size={16}
                    style={{ color: "var(--color-text-muted)" }}
                  />
                }
                options={unitOptions}
                value={unit}
                onChange={setUnit}
              />
            </div>
          </div>
          <footer className="modal-footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
            >
              Отмена
            </button>
            <button type="submit" className="btn btn--primary">
              Применить
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

const ModalDropdown = ({ icon, value, options, onChange, disabled }: any) => {
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
    <div
      className={`modal-custom-select ${disabled ? "disabled" : ""}`}
      ref={dropdownRef}
    >
      <select
        className="modal-custom-select__native"
        value={value}
        onChange={(e) => {
          if (disabled) return;
          onChange(e.target.value);
          setIsOpen(false);
        }}
        disabled={disabled}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        className={`modal-custom-select__toggle ${isOpen ? "active" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        type="button"
        disabled={disabled}
      >
        {icon}
        <span>{selectedOption?.label || options[0]?.label}</span>
        <ChevronDown size={16} className="icon-chevron" />
      </button>

      {isOpen && !disabled && (
        <div className="modal-custom-select__menu">
          {options.map((opt: any) => (
            <button
              key={opt.value}
              type="button"
              className={`modal-custom-select__item ${opt.value === value ? "selected" : ""}`}
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

interface TaskDetailsProps {
  task: Task | null;
  onClose: () => void;
}

const TaskDetails = ({ task, onClose }: TaskDetailsProps) => {
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TaskPayload | null>(null);

  const [dateDraft, setDateDraft] = useState("");
  const [timeDraft, setTimeDraft] = useState("");
  const [remindersDraft, setRemindersDraft] = useState<number[]>([]);
  const [isCustomReminderOpen, setIsCustomReminderOpen] = useState(false);

  const [newCheckLinkTitle, setNewCheckLinkTitle] = useState("");
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const isOpen = Boolean(task);

  const reminderOptions = [
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
        important: task.important || false,
      });

      setDateDraft(formatDateOnly(task.deadline));
      setTimeDraft(formatTimeOnly(task.deadline));

      const mappedReminders = task.reminders
        ? task.reminders.map((r: any) => r.minutesBefore || r)
        : [];
      setRemindersDraft(mappedReminders);

      setNewCheckLinkTitle("");
    } else {
      setDraft(null);
      setIsEditing(false);
    }
  }, [task]);

  const updateDraft = (updates: Partial<TaskPayload>) => {
    setDraft((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const handleAddReminder = (val: string) => {
    if (val === "none") return;
    if (val === "custom") {
      setIsCustomReminderOpen(true);
      return;
    }
    const minutes = Number(val);
    if (!remindersDraft.includes(minutes)) {
      setRemindersDraft([...remindersDraft, minutes].sort((a, b) => a - b));
    }
  };

  const handleCustomReminderSave = (minutes: number) => {
    if (!remindersDraft.includes(minutes)) {
      setRemindersDraft([...remindersDraft, minutes].sort((a, b) => a - b));
    }
  };

  const handleRemoveReminder = (minutes: number) => {
    setRemindersDraft(remindersDraft.filter((m) => m !== minutes));
  };

  const handleSave = () => {
    if (!draft || !task) return;

    let formattedDeadline = "";
    if (dateDraft) {
      const time = timeDraft || "00:00";
      formattedDeadline = new Date(`${dateDraft}T${time}`).toISOString();
    }

    const payload = {
      ...draft,
      deadline: formattedDeadline,
      reminderMinutes: remindersDraft,
    };

    updateTaskMutation.mutate(
      { id: task.id, updates: payload },
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
      important: task.important || false,
    });
    setDateDraft(formatDateOnly(task.deadline));
    setTimeDraft(formatTimeOnly(task.deadline));
    const mappedReminders = task.reminders
      ? task.reminders.map((r: any) => r.minutesBefore || r)
      : [];
    setRemindersDraft(mappedReminders);
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
                          <option value="work">Работа</option>
                          <option value="home">Дом</option>
                          <option value="ideas">Идеи</option>
                        </select>
                      ) : (
                        <span>
                          {task.projectId === "work"
                            ? "Работа"
                            : task.projectId === "home"
                              ? "Дом"
                              : task.projectId === "ideas"
                                ? "Идеи"
                                : "Входящие"}
                        </span>
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
                    options={reminderOptions}
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
