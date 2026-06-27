import Sidebar from "@/components/SideBar";
import TaskBoard from "@/components/TaskBoard/TaskBoard";
import TaskDetails from "@/components/TaskDetails/TaskDetails";
import CreateTaskModal from "@/components/CreateTaskModal/CreateTaskModal";
import Loader from "@/components/Loader";
import { useHome } from "@/hooks/useHome";
import "./Home.scss";

const Home = () => {
  const {
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
  } = useHome();

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

      <TaskDetails task={selectedTask} onClose={() => setSelectedTaskId(null)} />

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default Home;
