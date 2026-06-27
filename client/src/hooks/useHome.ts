import { useState } from "react";
import type { TaskPayload, Task } from "@/api/types";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/useTasks";

export const useHome = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: tasks = [], isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  const handleCreateTask = (payload: TaskPayload) => {
    createTask.mutate(payload, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  const handleUpdateTask = (id: string, updates: Partial<TaskPayload>) => {
    updateTask.mutate({ id, updates });
  };

  const handleDeleteTask = (id: string) => {
    deleteTask.mutate(id, {
      onSuccess: () => {
        if (selectedTaskId === id) setSelectedTaskId(null);
      },
    });
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  return {
    activeFilter,
    setActiveFilter,
    selectedTask,
    isModalOpen,
    setIsModalOpen,
    setSelectedTaskId,
    tasks,
    isLoading,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleSelectTask,
  };
};
