import { useState } from "react";
import { X, Clock, Bell } from "lucide-react";
import ModalDropdown from "@/components/ModalDropdown";
import "./CustomReminderModal.scss";

interface CustomReminderModalProps {
  onClose: () => void;
  onSave: (minutes: number, label: string) => void;
}

const unitOptions = [
  { value: "minutes", label: "Минут" },
  { value: "hours", label: "Часов" },
  { value: "days", label: "Дней" },
];

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

export default CustomReminderModal;
