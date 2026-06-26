import { useState, useMemo, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  ListTodo,
  Clock,
} from "lucide-react";
import type { Task } from "@/api/types";
import "./CalendarModal.scss";

interface CalendarModalProps {
  onClose: () => void;
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
}

const RUSSIAN_HOLIDAYS = [
  "01-01",
  "01-02",
  "01-03",
  "01-04",
  "01-05",
  "01-06",
  "01-07",
  "01-08",
  "02-23",
  "03-08",
  "05-01",
  "05-09",
  "06-12",
  "11-04",
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const CalendarModal = ({
  onClose,
  tasks,
  onSelectTask,
}: CalendarModalProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
    setActiveDay(null);
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
    setActiveDay(null);
  };

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      if (task.deadline) {
        const d = new Date(task.deadline);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(task);
      }
    });
    return map;
  }, [tasks]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startPadding = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  const isHoliday = (m: number, d: number) => {
    const key = `${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return RUSSIAN_HOLIDAYS.includes(key);
  };

  const monthName = currentDate.toLocaleString("ru-RU", { month: "long" });

  const handleMouseEnterCell = (dateKey: string, hasTasks: boolean) => {
    if (!hasTasks) return;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setActiveDay(dateKey);
  };

  const handleMouseLeaveCell = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setActiveDay(null);
    }, 200);
  };

  const handleClickCell = (dateKey: string, hasTasks: boolean) => {
    if (!hasTasks) return;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setActiveDay(activeDay === dateKey ? null : dateKey);
  };

  const getPanelPositionClass = (dateKey: string) => {
    const [y, m, d] = dateKey.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const col = (dateObj.getDay() + 6) % 7;
    return col <= 3 ? "side-panel--right" : "side-panel--left";
  };

  const checkIsOverdue = (task: Task) => {
    if (!task.deadline || task.completed) return false;
    const deadlineDate = new Date(task.deadline);
    const hasSpecificTime =
      deadlineDate.getHours() !== 0 || deadlineDate.getMinutes() !== 0;

    if (hasSpecificTime) {
      return deadlineDate.getTime() < new Date().getTime();
    } else {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime();
      const deadlineStart = new Date(
        deadlineDate.getFullYear(),
        deadlineDate.getMonth(),
        deadlineDate.getDate(),
      ).getTime();
      return deadlineStart < todayStart;
    }
  };

  const formatDeadlineTime = (dateString: string) => {
    const d = new Date(dateString);
    if (d.getHours() === 0 && d.getMinutes() === 0) return null;
    return d.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedActiveTasks = useMemo(() => {
    if (!activeDay) return [];
    const activeTasks = tasksByDate.get(activeDay) || [];
    return [...activeTasks].sort((a, b) => {
      const timeA = a.deadline ? new Date(a.deadline).getTime() : 0;
      const timeB = b.deadline ? new Date(b.deadline).getTime() : 0;
      return timeA - timeB;
    });
  }, [activeDay, tasksByDate]);

  const renderDays = () => {
    const days = [];

    for (let i = 0; i < startPadding; i++) {
      days.push(
        <div key={`pad-${i}`} className="calendar-day calendar-day--empty" />,
      );
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDayDate = new Date(year, month, i);
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const dayTasks = tasksByDate.get(dateKey) || [];

      const isWeekend =
        currentDayDate.getDay() === 0 || currentDayDate.getDay() === 6;
      const isHol = isHoliday(month, i);

      const today = new Date();
      const isToday =
        today.getDate() === i &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      const totalTasks = dayTasks.length;
      const completedTasks = dayTasks.filter((t) => t.completed).length;
      const isAllCompleted = totalTasks > 0 && totalTasks === completedTasks;
      const hasTasks = totalTasks > 0;
      const isActive = activeDay === dateKey;

      days.push(
        <div
          key={`day-${i}`}
          className={`calendar-day ${isWeekend ? "calendar-day--weekend" : ""} ${isHol ? "calendar-day--holiday" : ""} ${isToday ? "calendar-day--today" : ""} ${isActive ? "active" : ""}`}
          onMouseEnter={() => handleMouseEnterCell(dateKey, hasTasks)}
          onMouseLeave={handleMouseLeaveCell}
          onClick={() => handleClickCell(dateKey, hasTasks)}
        >
          <span
            className="calendar-day__number"
            title={isHol ? "Праздничный день" : ""}
          >
            {i}
          </span>

          {hasTasks && (
            <div className="calendar-day__summary">
              {isAllCompleted ? (
                <Check size={16} className="calendar-day__icon-success" />
              ) : (
                <>
                  <ListTodo size={14} className="calendar-day__icon-pending" />
                  <span className="calendar-day__summary-text">
                    {completedTasks}/{totalTasks}
                  </span>
                </>
              )}
            </div>
          )}
        </div>,
      );
    }

    return days;
  };

  const handleTaskClick = (task: Task) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setActiveDay(null);
    if (onSelectTask) {
      onSelectTask(task);
    }
    onClose();
  };

  const renderSidePanel = () => {
    if (!activeDay || sortedActiveTasks.length === 0) return null;

    const [y, m, d] = activeDay.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dateString = dateObj.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });

    return (
      <div
        className={`calendar-side-panel ${getPanelPositionClass(activeDay)}`}
        onMouseEnter={() => {
          if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        }}
        onMouseLeave={handleMouseLeaveCell}
      >
        <div className="side-panel__header">
          <h3 className="side-panel__title">{dateString}</h3>
          <button
            className="side-panel__close-mobile"
            onClick={() => setActiveDay(null)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="side-panel__list">
          {sortedActiveTasks.map((t) => {
            const isOverdue = checkIsOverdue(t);
            const timeStr = t.deadline ? formatDeadlineTime(t.deadline) : null;

            let indicatorClass = "side-panel__item-indicator";
            if (t.completed)
              indicatorClass += " side-panel__item-indicator--completed";
            else if (isOverdue)
              indicatorClass += " side-panel__item-indicator--overdue";

            return (
              <div
                key={t.id}
                className={`side-panel__item ${t.completed ? "side-panel__item--completed" : ""}`}
                onClick={() => handleTaskClick(t)}
              >
                <div className={indicatorClass} />
                <div className="side-panel__item-content">
                  <span className="side-panel__item-title">{t.title}</span>
                  {timeStr && (
                    <div className="side-panel__item-time">
                      <Clock size={12} />
                      <span>{timeStr}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content calendar-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="calendar-header">
          <div style={{ width: 32 }} className="calendar-spacer" />

          <div className="calendar-header-nav">
            <button className="calendar-btn" onClick={prevMonth}>
              <ChevronLeft size={20} />
            </button>
            <h2 className="calendar-title">
              {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
            </h2>
            <button className="calendar-btn" onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>

          <button className="modal-close calendar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="calendar-grid-container">
          <div className="calendar-grid">
            {WEEKDAYS.map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
            {renderDays()}
          </div>

          {renderSidePanel()}
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
