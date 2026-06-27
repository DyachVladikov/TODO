import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  ListTodo,
  Clock,
} from "lucide-react";
import type { Task } from "@/api/types";
import { useCalendar } from "@/hooks/useCalendar";
import { toDateKey, formatDeadlineTime } from "@/utils/date";
import { isTaskOverdue } from "@/utils/task";
import { WEEKDAYS, isHoliday, getPanelPositionClass } from "@/utils/calendar";
import "./CalendarModal.scss";

interface CalendarModalProps {
  onClose: () => void;
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
}

const CalendarModal = ({
  onClose,
  tasks,
  onSelectTask,
}: CalendarModalProps) => {
  const {
    year,
    month,
    monthName,
    startPadding,
    daysInMonth,
    activeDay,
    setActiveDay,
    tasksByDate,
    sortedActiveTasks,
    nextMonth,
    prevMonth,
    cancelHoverClose,
    handleMouseEnterCell,
    handleMouseLeaveCell,
    handleClickCell,
    handleTaskClick,
  } = useCalendar({ tasks, onSelectTask, onClose });

  const renderDays = () => {
    const days = [];

    for (let i = 0; i < startPadding; i++) {
      days.push(
        <div key={`pad-${i}`} className="calendar-day calendar-day--empty" />,
      );
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDayDate = new Date(year, month, i);
      const dateKey = toDateKey(currentDayDate);
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

  const renderSidePanel = () => {
    if (!activeDay || sortedActiveTasks.length === 0) return null;

    const [y, m, d] = activeDay.split("-").map(Number);
    const dateString = new Date(y, m - 1, d).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });

    return (
      <div
        className={`calendar-side-panel ${getPanelPositionClass(activeDay)}`}
        onMouseEnter={cancelHoverClose}
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
            const isOverdue = isTaskOverdue(t);
            const timeStr = formatDeadlineTime(t.deadline);

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
