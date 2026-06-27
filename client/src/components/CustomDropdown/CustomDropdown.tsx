import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import "./CustomDropdown.scss";

export interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  icon?: React.ReactNode;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}

const CustomDropdown = ({
  icon,
  value,
  options,
  onChange,
}: CustomDropdownProps) => {
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
    <div className="custom-dropdown" ref={dropdownRef}>
      <select
        className="custom-dropdown__native"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(false);
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        className={`custom-dropdown__toggle ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {icon}
        <span className="custom-dropdown__label">{selectedOption?.label}</span>
        <ChevronDown size={14} className="icon-chevron" />
      </button>

      {isOpen && (
        <div className="custom-dropdown__menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`custom-dropdown__item ${opt.value === value ? "selected" : ""}`}
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

export default CustomDropdown;
