import { useState } from "react";
import Sidebar from "@/components/SideBar";
import TaskBoard from "@/components/TaskBoard/TaskBoard";
import TaskDetails from "@/components/TaskDetails/TaskDetails";
import CreateTaskModal from "@/components/CreateTaskModal/CreateTaskModal";
import Loader from "@/components/Loader";
import type { TaskPayload, Task } from "@/api/types"; // <--- Добавили Task сюда
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/useTasks";
import "./Home.scss";

const Home = () => {
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

  // Вынесли логику выбора задачи в отдельную функцию
  const handleSelectTask = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="home">
      <Sidebar
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onSelectTask={handleSelectTask}
      />

      <TaskBoard
        activeFilter={activeFilter}
        tasks={tasks}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onSelectTask={handleSelectTask}
        onOpenModal={() => setIsModalOpen(true)}
      />

      <TaskDetails
        task={selectedTask}
        onClose={() => setSelectedTaskId(null)}
      />

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default Home;
