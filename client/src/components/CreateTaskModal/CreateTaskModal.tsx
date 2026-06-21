import { useState, useEffect } from "react";
import { X, Calendar, Flag, Folder, AlignLeft, Tag } from "lucide-react";
import type { TaskPayload, Priority } from "@/api/types";
import "./CreateTaskModal.scss";

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
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [deadline, setDeadline] = useState("");
  const [projectId, setProjectId] = useState("inbox");
  const [tagsInput, setTagsInput] = useState("");

  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setNotes("");
      setPriority("medium");
      setDeadline("");
      setProjectId("inbox");
      setTagsInput("");
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

          <div className="form-group">
            <label className="form-label">
              <Folder size={16} />
              Проект
            </label>
            <select
              className="form-input form-select"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="inbox">Входящие</option>
              <option value="work">Работа</option>
              <option value="home">Дом</option>
            </select>
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
