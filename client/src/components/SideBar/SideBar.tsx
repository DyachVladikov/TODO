import {
  Inbox,
  Calendar,
  Star,
  CheckCircle,
  CheckSquare,
  Folder as FolderIcon,
  Plus,
  LogOut,
  X,
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useLogout } from "@/hooks/useApi";
import { useFolders } from "@/hooks/useFolders";
import "./SideBar.scss";

interface SidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

const Sidebar = ({ activeFilter, setActiveFilter }: SidebarProps) => {
  const { data: tasks = [] } = useTasks();
  const { folders, addFolder, deleteFolder, isAdding } = useFolders();
  const logout = useLogout();

  const todayTasksCount = tasks.filter((task) => {
    if (!task.deadline || task.completed) return false;
    const today = new Date();
    const taskDate = new Date(task.deadline);
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const handleAddFolder = () => {
    const name = prompt("Введите название новой папки:");
    if (name && name.trim()) {
      addFolder(name.trim());
    }
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

  const defaultProjects = [
    { id: "work", label: "Работа", color: "#3B82F6" },
    { id: "home", label: "Дом", color: "#10B981" },
    { id: "ideas", label: "Идеи", color: "#8B5CF6" },
  ];

  const isFolderActive =
    defaultProjects.some((p) => p.id === activeFilter) ||
    folders.some((f) => f.id === activeFilter);

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <CheckSquare size={24} className="sidebar__logo-icon" />
        <span className="sidebar__text">TaskFlow</span>
      </div>

      <nav className="sidebar__nav">
        <button
          className={`sidebar__item ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          <Inbox size={18} />
          <span className="sidebar__text">Все задачи</span>
        </button>

        <button
          className={`sidebar__item ${activeFilter === "today" ? "active" : ""}`}
          onClick={() => setActiveFilter("today")}
        >
          <Calendar size={18} />
          <span className="sidebar__text">Сегодня</span>
          {todayTasksCount > 0 && (
            <span className="sidebar__badge">{todayTasksCount}</span>
          )}
        </button>

        <button
          className={`sidebar__item ${activeFilter === "important" ? "active" : ""}`}
          onClick={() => setActiveFilter("important")}
        >
          <Star size={18} />
          <span className="sidebar__text">Важные</span>
        </button>

        <button
          className={`sidebar__item ${activeFilter === "completed" ? "active" : ""}`}
          onClick={() => setActiveFilter("completed")}
        >
          <CheckCircle size={18} />
          <span className="sidebar__text">Завершённые</span>
        </button>

        {/* МОБИЛЬНАЯ КНОПКА ПАПОК */}
        <div
          className={`sidebar__item sidebar__item--mobile-folder ${isFolderActive ? "active" : ""}`}
        >
          <FolderIcon size={18} />
          <select
            className="sidebar__mobile-native-select"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            <option value="none" disabled>
              Выберите папку...
            </option>
            <optgroup label="Стандартные">
              {defaultProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </optgroup>
            {folders.length > 0 && (
              <optgroup label="Мои папки">
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </nav>

      <div className="sidebar__projects">
        <div className="sidebar__projects-header">
          <h3 className="sidebar__text">ПРОЕКТЫ</h3>
          <button
            className="sidebar__projects-add"
            onClick={handleAddFolder}
            disabled={isAdding}
            title="Создать папку"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="sidebar__projects-list">
          {defaultProjects.map((project) => (
            <button
              key={project.id}
              className={`sidebar__item sidebar__item--project ${activeFilter === project.id ? "active" : ""}`}
              onClick={() => setActiveFilter(project.id)}
            >
              <FolderIcon size={18} style={{ color: project.color }} />
              <span className="sidebar__text">{project.label}</span>
            </button>
          ))}

          {folders.map((folder) => (
            <button
              key={folder.id}
              className={`sidebar__item sidebar__item--project ${activeFilter === folder.id ? "active" : ""}`}
              onClick={() => setActiveFilter(folder.id)}
            >
              <FolderIcon size={18} style={{ color: "#FFFFFF" }} />
              <span className="sidebar__text">{folder.name}</span>
              <div
                className="sidebar__folder-delete"
                onClick={(e) => handleDeleteFolder(e, folder.id)}
                title="Удалить папку"
              >
                <X size={14} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar__footer">
        <button
          className="sidebar__item sidebar__item--logout"
          onClick={logout}
        >
          <LogOut size={18} />
          <span className="sidebar__text">Выйти</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
