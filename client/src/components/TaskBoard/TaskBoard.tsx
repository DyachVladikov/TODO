import { Plus, Search, Folder, Tag, Flag, ArrowUpDown } from "lucide-react";
import TaskItem from "./../TaskItem";
import type { Task } from "@/api/types";
import CustomDropdown from "@/components/CustomDropdown";
import { useTaskBoard } from "@/hooks/useTaskBoard";
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
  const {
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
    projectOptions,
    priorityOptions,
    sortOptions,
    sortedTasks,
    boardTitle,
  } = useTaskBoard(activeFilter, tasks);

  return (
    <main className="task-board">
      <div className="task-board__header">
        <div className="task-board__header-title">
          <h2>{boardTitle}</h2>
          <span className="task-board__count">{sortedTasks.length} задач</span>
        </div>

        <button className="task-board__add-btn" onClick={onOpenModal}>
          <Plus size={18} />
          <span>Создать задачу</span>
        </button>
      </div>

      <div className="task-board__filters">
        <div className="filter-input-group filter-input-group--search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <CustomDropdown
          icon={<Folder size={16} />}
          options={projectOptions}
          value={filterProject}
          onChange={setFilterProject}
        />

        <CustomDropdown
          icon={<Flag size={16} />}
          options={priorityOptions}
          value={filterPriority}
          onChange={setFilterPriority}
        />

        <CustomDropdown
          icon={<ArrowUpDown size={16} />}
          options={sortOptions}
          value={sortBy}
          onChange={setSortBy}
        />

        <div className="filter-input-group filter-input-group--tag">
          <Tag size={16} />
          <input
            type="text"
            placeholder="Тег..."
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          />
        </div>
      </div>

      <div className="task-board__list">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
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
            <p>Ничего не найдено.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default TaskBoard;
