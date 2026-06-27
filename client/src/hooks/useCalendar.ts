import { useState, useMemo, useRef } from "react";
import type { Task } from "@/api/types";
import { toDateKey } from "@/utils/date";
import { getMonthGrid } from "@/utils/calendar";

interface UseCalendarParams {
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
  onClose: () => void;
}

export const useCalendar = ({
  tasks,
  onSelectTask,
  onClose,
}: UseCalendarParams) => {
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
        const key = toDateKey(new Date(task.deadline));
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(task);
      }
    });
    return map;
  }, [tasks]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const { startPadding, daysInMonth } = getMonthGrid(year, month);
  const monthName = currentDate.toLocaleString("ru-RU", { month: "long" });

  const cancelHoverClose = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  };

  const handleMouseEnterCell = (dateKey: string, hasTasks: boolean) => {
    if (!hasTasks) return;
    cancelHoverClose();
    setActiveDay(dateKey);
  };

  const handleMouseLeaveCell = () => {
    cancelHoverClose();
    hoverTimeout.current = setTimeout(() => setActiveDay(null), 200);
  };

  const handleClickCell = (dateKey: string, hasTasks: boolean) => {
    if (!hasTasks) return;
    cancelHoverClose();
    setActiveDay(activeDay === dateKey ? null : dateKey);
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

  const handleTaskClick = (task: Task) => {
    cancelHoverClose();
    setActiveDay(null);
    if (onSelectTask) onSelectTask(task);
    onClose();
  };

  return {
    // Состояние / производные
    year,
    month,
    monthName,
    startPadding,
    daysInMonth,
    activeDay,
    setActiveDay,
    tasksByDate,
    sortedActiveTasks,
    // Обработчики
    nextMonth,
    prevMonth,
    cancelHoverClose,
    handleMouseEnterCell,
    handleMouseLeaveCell,
    handleClickCell,
    handleTaskClick,
  };
};
