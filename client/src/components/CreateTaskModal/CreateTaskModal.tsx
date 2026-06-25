import { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Flag,
  Folder,
  AlignLeft,
  Tag,
  Star,
  ChevronDown,
  Clock,
  Bell,
} from "lucide-react";
import type { Priority } from "@/api/types";
import { useFolders } from "@/hooks/useFolders";
import "./CreateTaskModal.scss";

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

interface CustomReminderModalProps {
  onClose: () => void;
  onSave: (minutes: number, label: string) => void;
}

const CustomReminderModal = ({ onClose, onSave }: CustomReminderModalProps) => {
  const [amount, setAmount] = useState<number | string>(10);
  const [unit, setUnit] = useState<string>("minutes");

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (numAmount <= 0) return;

    let minutes = numAmount;
    let unitLabel = "мин.";

    if (unit === "hours") {
      minutes = numAmount * 60;
      unitLabel = "ч.";
    } else if (unit === "days") {
      minutes = numAmount * 1440;
      unitLabel = "дн.";
    }

    onSave(minutes, `За ${numAmount} ${unitLabel}`);
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
        <form
          onSubmit={handleConfirm}
          className="modal-form modal-form--reminder"
        >
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

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
}

const CreateTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateTaskModalProps) => {
  const { folders } = useFolders();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  const [dateDeadline, setDateDeadline] = useState("");
  const [timeDeadline, setTimeDeadline] = useState("");

  const [reminderMinutes, setReminderMinutes] = useState<string>("none");
  const [isCustomReminderOpen, setIsCustomReminderOpen] = useState(false);
  const [customReminderOpt, setCustomReminderOpt] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const [projectId, setProjectId] = useState("inbox");
  const [tagsInput, setTagsInput] = useState("");
  const [important, setImportant] = useState(false);
  const [error, setError] = useState(false);

  const projectOptions = [
    { value: "inbox", label: "Входящие" },
    { value: "work", label: "Работа" },
    { value: "home", label: "Дом" },
    { value: "ideas", label: "Идеи" },
    ...folders.map((f) => ({ value: f.id, label: f.name })),
  ];

  const baseReminderOptions = [
    { value: "none", label: "Без напоминания" },
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

  const reminderOptions = customReminderOpt
    ? [
        customReminderOpt,
        ...baseReminderOptions.filter((o) => o.value !== "custom"),
        baseReminderOptions.find((o) => o.value === "custom")!,
      ]
    : baseReminderOptions;

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setNotes("");
      setPriority("medium");
      setDateDeadline("");
      setTimeDeadline("");
      setReminderMinutes("none");
      setCustomReminderOpt(null);
      setProjectId("inbox");
      setTagsInput("");
      setImportant(false);
      setError(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!dateDeadline) {
      setReminderMinutes("none");
      setCustomReminderOpt(null);
    }
  }, [dateDeadline]);

  const handleReminderChange = (val: string) => {
    if (val === "custom") {
      setIsCustomReminderOpen(true);
    } else {
      setReminderMinutes(val);
    }
  };

  const handleCustomReminderSave = (minutes: number, label: string) => {
    const stringMin = String(minutes);
    setCustomReminderOpt({ value: stringMin, label });
    setReminderMinutes(stringMin);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError(true);
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    let formattedDeadline = "";
    if (dateDeadline) {
      const time = timeDeadline || "00:00";
      formattedDeadline = new Date(`${dateDeadline}T${time}`).toISOString();
    }

    const remindersArr =
      reminderMinutes !== "none" ? [Number(reminderMinutes)] : [];

    onSubmit({
      title: title.trim(),
      notes: notes.trim(),
      priority,
      deadline: formattedDeadline,
      projectId,
      tags,
      important,
      reminderMinutes: remindersArr,
    });

    onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <header className="modal-header">
            <h2>Новая задача</h2>
            <button className="modal-close" onClick={onClose} type="button">
              <X size={20} />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <input
                type="text"
                className={`form-input form-input--large ${error ? "form-input--error" : ""}`}
                placeholder="Название задачи..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(false);
                }}
                autoFocus
              />
              {error && (
                <span className="form-error-text">Название обязательно</span>
              )}
            </div>

            <div className="form-group">
              <div className="form-input-with-icon">
                <AlignLeft size={18} />
                <textarea
                  className="form-input form-textarea"
                  placeholder="Описание задачи..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-input-with-icon">
                <Tag size={18} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Теги (через запятую)..."
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group form-group--half">
                <label className="form-label">
                  <Flag size={16} />
                  Приоритет
                </label>
                <div className="priority-selector">
                  <button
                    type="button"
                    className={`priority-btn priority-btn--low ${priority === "low" ? "active" : ""}`}
                    onClick={() => setPriority("low")}
                  >
                    Низкий
                  </button>
                  <button
                    type="button"
                    className={`priority-btn priority-btn--medium ${priority === "medium" ? "active" : ""}`}
                    onClick={() => setPriority("medium")}
                  >
                    Средний
                  </button>
                  <button
                    type="button"
                    className={`priority-btn priority-btn--high ${priority === "high" ? "active" : ""}`}
                    onClick={() => setPriority("high")}
                  >
                    Срочно
                  </button>
                </div>
              </div>

              <div className="form-group form-group--half">
                <label className="form-label">
                  <Folder size={16} />
                  Проект
                </label>
                <ModalDropdown
                  icon={
                    <Folder
                      size={16}
                      style={{ color: "var(--color-text-muted)" }}
                    />
                  }
                  options={projectOptions}
                  value={projectId}
                  onChange={setProjectId}
                />
              </div>
            </div>

            <div className="form-row form-row--triple">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Дата
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={dateDeadline}
                  onChange={(e) => setDateDeadline(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} />
                  Время
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={timeDeadline}
                  onChange={(e) => setTimeDeadline(e.target.value)}
                  disabled={!dateDeadline}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Bell size={16} />
                  Напоминание
                </label>
                <ModalDropdown
                  icon={
                    <Bell
                      size={16}
                      style={{ color: "var(--color-text-muted)" }}
                    />
                  }
                  options={reminderOptions}
                  value={reminderMinutes}
                  onChange={handleReminderChange}
                  disabled={!dateDeadline}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group form-group--half">
                <label className="form-label">
                  <Star size={16} />
                  Важность
                </label>
                <button
                  type="button"
                  className={`important-toggle-btn ${important ? "active" : ""}`}
                  onClick={() => setImportant(!important)}
                >
                  <Star size={18} fill={important ? "currentColor" : "none"} />
                  <span>{important ? "Важная задача" : "Обычная задача"}</span>
                </button>
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
                Создать задачу
              </button>
            </footer>
          </form>
        </div>
      </div>

      {isCustomReminderOpen && (
        <CustomReminderModal
          onClose={() => setIsCustomReminderOpen(false)}
          onSave={handleCustomReminderSave}
        />
      )}
    </>
  );
};

export default CreateTaskModal;
