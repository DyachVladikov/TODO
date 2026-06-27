import {
  Inbox,
  Calendar,
  CalendarDays,
  CalendarRange,
  Star,
  CheckCircle,
  CheckSquare,
  Folder as FolderIcon,
  Plus,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import type { Task } from "@/api/types";
import AddFolderModal from "@/components/AddFolderModal";
import CalendarModal from "@/components/CalendarModal";
import { useSidebar } from "@/hooks/useSidebar";
import { DEFAULT_PROJECTS } from "@/utils/task";
import "./SideBar.scss";

interface SidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  onSelectTask: (task: Task) => void;
}

const Sidebar = ({
  activeFilter,
  setActiveFilter,
  onSelectTask,
}: SidebarProps) => {
  const {
    isMobileOpen,
    setIsMobileOpen,
    isFolderModalOpen,
    setIsFolderModalOpen,
    isCalendarOpen,
    setIsCalendarOpen,
    tasks,
    folders,
    isAdding,
    isTelegram,
    logout,
    allTasksCount,
    importantTasksCount,
    completedTasksCount,
    todayTasksCount,
    weeklyTasksCount,
    getProjectCount,
    handleAddFolderSave,
    handleDeleteFolder,
    handleFilterSelect,
  } = useSidebar(activeFilter, setActiveFilter);

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
              {allTasksCount > 0 && (
                <span className="sidebar__badge">{allTasksCount}</span>
              )}
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
              className={`sidebar__item ${activeFilter === "weekly" ? "active" : ""}`}
              onClick={() => handleFilterSelect("weekly")}
            >
              <CalendarDays size={18} />
              <span className="sidebar__text">Ближайшие 7 дней</span>
              {weeklyTasksCount > 0 && (
                <span className="sidebar__badge">{weeklyTasksCount}</span>
              )}
            </button>
            <button
              className={`sidebar__item ${activeFilter === "important" ? "active" : ""}`}
              onClick={() => handleFilterSelect("important")}
            >
              <Star size={18} />
              <span className="sidebar__text">Важные</span>
              {importantTasksCount > 0 && (
                <span className="sidebar__badge">{importantTasksCount}</span>
              )}
            </button>

            <button
              className={`sidebar__item ${activeFilter === "completed" ? "active" : ""}`}
              onClick={() => handleFilterSelect("completed")}
            >
              <CheckCircle size={18} />
              <span className="sidebar__text">Завершённые</span>
              {completedTasksCount > 0 && (
                <span className="sidebar__badge">{completedTasksCount}</span>
              )}
            </button>
            <button
              className="sidebar__item"
              onClick={() => {
                setIsCalendarOpen(true);
                setIsMobileOpen(false);
              }}
            >
              <CalendarRange size={18} />
              <span className="sidebar__text">Календарь</span>
            </button>
          </nav>

          <div className="sidebar__projects">
            <div className="sidebar__projects-header">
              <h3 className="sidebar__text">ПАПКИ</h3>
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
              {DEFAULT_PROJECTS.map((project) => {
                const count = getProjectCount(project.id);
                return (
                  <button
                    key={project.id}
                    className={`sidebar__item sidebar__item--project ${activeFilter === project.id ? "active" : ""}`}
                    onClick={() => handleFilterSelect(project.id)}
                  >
                    <FolderIcon size={18} style={{ color: project.color }} />
                    <span className="sidebar__text">{project.label}</span>
                    {count > 0 && (
                      <span className="sidebar__badge">{count}</span>
                    )}
                  </button>
                );
              })}

              {folders.map((folder) => {
                const count = getProjectCount(folder.id);
                return (
                  <button
                    key={folder.id}
                    className={`sidebar__item sidebar__item--project ${activeFilter === folder.id ? "active" : ""}`}
                    onClick={() => handleFilterSelect(folder.id)}
                  >
                    <FolderIcon size={18} style={{ color: "#FFFFFF" }} />
                    <span className="sidebar__text">{folder.name}</span>
                    {count > 0 && (
                      <span className="sidebar__badge">{count}</span>
                    )}
                    <div
                      className="sidebar__folder-delete"
                      onClick={(e) => handleDeleteFolder(e, folder.id)}
                      title="Удалить папку"
                    >
                      <X size={14} />
                    </div>
                  </button>
                );
              })}
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

      {isCalendarOpen && (
        <CalendarModal
          onClose={() => setIsCalendarOpen(false)}
          tasks={tasks}
          onSelectTask={onSelectTask}
        />
      )}
    </>
  );
};

export default Sidebar;
