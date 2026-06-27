import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useLogout } from "@/hooks/useApi";
import { useFolders } from "@/hooks/useFolders";
import { isToday, isWithinNextWeek } from "@/utils/date";

export const useSidebar = (
  activeFilter: string,
  setActiveFilter: (filter: string) => void,
) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { data: tasks = [] } = useTasks();
  const { folders, addFolder, deleteFolder, isAdding } = useFolders();
  const logout = useLogout();
  const isTelegram = Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user);

  const allTasksCount = tasks.filter((task) => !task.completed).length;
  const importantTasksCount = tasks.filter(
    (task) => task.important && !task.completed,
  ).length;
  const completedTasksCount = tasks.filter((task) => task.completed).length;
  const todayTasksCount = tasks.filter(
    (task) => !task.completed && isToday(task.deadline),
  ).length;
  const weeklyTasksCount = tasks.filter(
    (task) => !task.completed && isWithinNextWeek(task.deadline),
  ).length;

  const getProjectCount = (projectId: string) =>
    tasks.filter((task) => task.projectId === projectId && !task.completed)
      .length;

  const handleAddFolderSave = (name: string) => {
    addFolder(name);
  };

  const handleDeleteFolder = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Уверены, что хотите удалить эту папку? Задачи в ней останутся.",
      )
    ) {
      deleteFolder(id);
      if (activeFilter === id) setActiveFilter("all");
    }
  };

  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter);
    setIsMobileOpen(false);
  };

  return {
    // Состояние
    isMobileOpen,
    setIsMobileOpen,
    isFolderModalOpen,
    setIsFolderModalOpen,
    isCalendarOpen,
    setIsCalendarOpen,
    // Данные
    tasks,
    folders,
    isAdding,
    isTelegram,
    logout,
    // Счётчики
    allTasksCount,
    importantTasksCount,
    completedTasksCount,
    todayTasksCount,
    weeklyTasksCount,
    getProjectCount,
    // Обработчики
    handleAddFolderSave,
    handleDeleteFolder,
    handleFilterSelect,
  };
};
