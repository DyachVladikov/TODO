import { Plus } from "lucide-react";
import TaskItem from "./../TaskItem";
import type { Task } from "@/api/types";
import "./TaskBoard.scss";

interface TaskBoardProps {
  activeFilter: string;
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onOpenModal: () => void;
}

const TaskBoard = ({
  activeFilter,
  tasks,
  onUpdateTask,
  onDeleteTask,
  onSelectTask,
  onOpenModal,
}: TaskBoardProps) => {
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "completed") return task.completed;
    if (activeFilter === "important") return task.important;
    if (activeFilter === "all") return true;
    return true;
  });

  const getBoardTitle = () => {
    switch (activeFilter) {
      case "completed":
        return "Завершённые";
      case "important":
        return "Важные";
      case "today":
        return "Сегодня";
      default:
        return "Все задачи";
    }
  };

  return (
    <main className="task-board">
      <div className="task-board__header">
        <div className="task-board__header-title">
          <h2>{getBoardTitle()}</h2>
          <span className="task-board__count">
            {filteredTasks.length} задач(а)
          </span>
        </div>

        <button className="task-board__add-btn" onClick={onOpenModal}>
          <Plus size={18} />
          <span>Создать задачу</span>
        </button>
      </div>

      <div className="task-board__list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleStatus={() =>
                onUpdateTask(task.id, { completed: !task.completed })
              }
              onToggleImportant={() =>
                onUpdateTask(task.id, { important: !task.important })
              }
              onDelete={() => onDeleteTask(task.id)}
              onClick={onSelectTask}
            />
          ))
        ) : (
          <div className="task-board__empty">
            <p>Здесь пока нет задач.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default TaskBoard;
