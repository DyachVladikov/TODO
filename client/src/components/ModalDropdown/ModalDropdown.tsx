import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import "./ModalDropdown.scss";

export interface DropdownOption {
  value: string;
  label: string;
}

interface ModalDropdownProps {
  icon?: React.ReactNode;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ModalDropdown = ({
  icon,
  value,
  options,
  onChange,
  disabled,
}: ModalDropdownProps) => {
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

  const selectedOption = options.find((o) => o.value === value);

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
        {options.map((opt) => (
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
          {options.map((opt) => (
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

export default ModalDropdown;
