import { useState } from "react";
import type { Task } from "@/api/types";
import { useFolders } from "@/hooks/useFolders";
import type { DropdownOption } from "@/components/CustomDropdown";
import {
  BOARD_BASE_PROJECT_OPTIONS,
  BOARD_PRIORITY_OPTIONS,
  BOARD_SORT_OPTIONS,
  filterTasks,
  sortTasks,
  getBoardTitle,
} from "@/utils/board";

export const useTaskBoard = (activeFilter: string, tasks: Task[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterTag, setFilterTag] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const { folders } = useFolders();

  const projectOptions: DropdownOption[] = [
    ...BOARD_BASE_PROJECT_OPTIONS,
    ...folders.map((f) => ({ value: f.id, label: f.name })),
  ];

  const sortedTasks = sortTasks(
    filterTasks(tasks, {
      activeFilter,
      searchQuery,
      filterProject,
      filterPriority,
      filterTag,
    }),
    sortBy,
  );

  const boardTitle = getBoardTitle(activeFilter, folders);

  return {
    // Состояние фильтров
    searchQuery,
    setSearchQuery,
    filterProject,
    setFilterProject,
    filterPriority,
    setFilterPriority,
    filterTag,
    setFilterTag,
    sortBy,
    setSortBy,
    // Опции выпадающих списков
    projectOptions,
    priorityOptions: BOARD_PRIORITY_OPTIONS,
    sortOptions: BOARD_SORT_OPTIONS,
    // Производные данные
    sortedTasks,
    boardTitle,
  };
};
