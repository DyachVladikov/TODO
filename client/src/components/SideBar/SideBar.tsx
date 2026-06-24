import { useState } from "react";
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
  Menu, // Добавили иконку бургера
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
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Состояние для мобильного меню
  const { data: tasks = [] } = useTasks();
  const { folders, addFolder, deleteFolder, isAdding } = useFolders();
  const logout = useLogout();
  const isTelegram = Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user);

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

  // Обертка для выбора фильтра, чтобы закрывать меню на мобилках
  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter);
    setIsMobileOpen(false);
  };

  const defaultProjects = [
    { id: "work", label: "Работа", color: "#3B82F6" },
    { id: "home", label: "Дом", color: "#10B981" },
    { id: "ideas", label: "Идеи", color: "#8B5CF6" },
  ];

  return (
    <>
      {/* Затемнение фона на мобилках при открытом меню */}
      <div
        className={`sidebar__overlay ${isMobileOpen ? "sidebar__overlay--active" : ""}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        className={`sidebar ${isMobileOpen ? "sidebar--mobile-open" : ""}`}
      >
        {/* Кнопка бургера (видна только на мобилке) */}
        <button
          className="sidebar__burger"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Контент сайдбара (на десктопе всегда виден, на мобилке - внутри dropdown) */}
        <div className="sidebar__content">
          <div className="sidebar__logo">
            <CheckSquare size={24} className="sidebar__logo-icon" />
            <span className="sidebar__text">TaskFlow</span>
          </div>

          <nav className="sidebar__nav">
            <button
              className={`sidebar__item ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => handleFilterSelect("all")}
            >
              <Inbox size={18} />
              <span className="sidebar__text">Все задачи</span>
            </button>

            <button
              className={`sidebar__item ${activeFilter === "today" ? "active" : ""}`}
              onClick={() => handleFilterSelect("today")}
            >
              <Calendar size={18} />
              <span className="sidebar__text">Сегодня</span>
              {todayTasksCount > 0 && (
                <span className="sidebar__badge">{todayTasksCount}</span>
              )}
            </button>

            <button
              className={`sidebar__item ${activeFilter === "important" ? "active" : ""}`}
              onClick={() => handleFilterSelect("important")}
            >
              <Star size={18} />
              <span className="sidebar__text">Важные</span>
            </button>

            <button
              className={`sidebar__item ${activeFilter === "completed" ? "active" : ""}`}
              onClick={() => handleFilterSelect("completed")}
            >
              <CheckCircle size={18} />
              <span className="sidebar__text">Завершённые</span>
            </button>
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
                  onClick={() => handleFilterSelect(project.id)}
                >
                  <FolderIcon size={18} style={{ color: project.color }} />
                  <span className="sidebar__text">{project.label}</span>
                </button>
              ))}

              {folders.map((folder) => (
                <button
                  key={folder.id}
                  className={`sidebar__item sidebar__item--project ${activeFilter === folder.id ? "active" : ""}`}
                  onClick={() => handleFilterSelect(folder.id)}
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

          {!isTelegram && (
            <div className="sidebar__footer">
              <button
                className="sidebar__item sidebar__item--logout"
                onClick={logout}
              >
                <LogOut size={18} />
                <span className="sidebar__text">Выйти</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
