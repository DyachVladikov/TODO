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
  Menu,
  FolderPlus,
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useLogout } from "@/hooks/useApi";
import { useFolders } from "@/hooks/useFolders";
import "./SideBar.scss";

interface AddFolderModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

const AddFolderModal = ({ onClose, onSave }: AddFolderModalProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <div className="modal-overlay modal-overlay--nested" onClick={onClose}>
      <div
        className="modal-content modal-content--compact"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header compact-header">
          <div className="compact-header-title">
            <FolderPlus size={18} className="header-icon" />
            <h3>Новая папка</h3>
          </div>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="modal-form">
          <div
            className="form-row compact-row"
            style={{ marginBottom: "20px" }}
          >
            <div className="form-group" style={{ flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Название папки..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <footer className="modal-footer compact-footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn--primary gradient-btn"
              disabled={!name.trim()}
            >
              Создать
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

interface SidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

const Sidebar = ({ activeFilter, setActiveFilter }: SidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
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

  const defaultProjects = [
    { id: "work", label: "Работа", color: "#3B82F6" },
    { id: "home", label: "Дом", color: "#10B981" },
    { id: "ideas", label: "Идеи", color: "#8B5CF6" },
  ];

  return (
    <>
      <div
        className={`sidebar__overlay ${isMobileOpen ? "sidebar__overlay--active" : ""}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        className={`sidebar ${isMobileOpen ? "sidebar--mobile-open" : ""}`}
      >
        <button
          className="sidebar__burger"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

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
                onClick={() => setIsFolderModalOpen(true)}
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

      {isFolderModalOpen && (
        <AddFolderModal
          onClose={() => setIsFolderModalOpen(false)}
          onSave={handleAddFolderSave}
        />
      )}
    </>
  );
};

export default Sidebar;
