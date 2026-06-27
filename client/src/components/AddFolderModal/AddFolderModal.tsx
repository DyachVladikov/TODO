import { useState } from "react";
import { X, FolderPlus } from "lucide-react";
import "./AddFolderModal.scss";

interface AddFolderModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

const AddFolderModal = ({ onClose, onSave }: AddFolderModalProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <div className="modal-overlay modal-overlay--nested" onClick={onClose}>
      <div
        className="modal-content modal-content--compact"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header compact-header">
          <div className="compact-header-title">
            <FolderPlus size={18} className="header-icon" />
            <h3>Новая папка</h3>
          </div>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row compact-row" style={{ marginBottom: "20px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Название папки..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <footer className="modal-footer compact-footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn--primary gradient-btn"
              disabled={!name.trim()}
            >
              Создать
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddFolderModal;
