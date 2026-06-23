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
} from "lucide-react";
import type { TaskPayload, Priority } from "@/api/types";
import { useFolders } from "@/hooks/useFolders";
import "./CreateTaskModal.scss";

// Кастомный Dropdown специально для модалки (с нативным селектом для мобилок)
const ModalDropdown = ({ icon, value, options, onChange }: any) => {
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
    <div className="modal-custom-select" ref={dropdownRef}>
      {/* Невидимый нативный селект для мобилок */}
      <select
        className="modal-custom-select__native"
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
        className={`modal-custom-select__toggle ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {icon}
        <span>{selectedOption?.label}</span>
        <ChevronDown size={16} className="icon-chevron" />
      </button>

      {isOpen && (
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

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: TaskPayload) => void;
}

const CreateTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateTaskModalProps) => {
  const { folders } = useFolders(); // Достаем реальные папки из базы

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [deadline, setDeadline] = useState("");
  const [projectId, setProjectId] = useState("inbox");
  const [tagsInput, setTagsInput] = useState("");
  const [important, setImportant] = useState(false); // НОВЫЙ СТЕЙТ ВАЖНОСТИ

  const [error, setError] = useState(false);

  // Формируем список папок
  const projectOptions = [
    { value: "work", label: "Работа" },
    { value: "home", label: "Дом" },
    { value: "home", label: "Идеи" },
    ...folders.map((f) => ({ value: f.id, label: f.name })),
  ];

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setNotes("");
      setPriority("medium");
      setDeadline("");
      setProjectId("work");
      setTagsInput("");
      setImportant(false);
      setError(false);
    }
  }, [isOpen]);

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

    onSubmit({
      title: title.trim(),
      notes: notes.trim(),
      priority,
      deadline,
      projectId,
      tags,
      important, // Отправляем важность
    });

    onClose();
  };

  return (
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
                <Calendar size={16} />
                Дедлайн
              </label>
              <input
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* НОВЫЙ РЯД: Проект и Важность */}
          <div className="form-row">
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
  );
};

export default CreateTaskModal;
