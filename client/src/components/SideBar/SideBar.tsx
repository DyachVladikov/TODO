import { useLogout } from "@/hooks/useApi";
import {
  CheckSquare,
  Inbox,
  Calendar,
  Star,
  CheckCircle2,
  LogOut,
  Plus,
  Folder,
  Settings,
} from "lucide-react";
import "./Sidebar.scss";

// 1. Расширяем фильтры иконками
const FILTERS = [
  { id: "all", label: "Все задачи", icon: Inbox },
  { id: "today", label: "Сегодня", icon: Calendar },
  { id: "important", label: "Важные", icon: Star },
  { id: "completed", label: "Завершённые", icon: CheckCircle2 },
];

// 2. Добавляем моковые проекты (потом будем получать их с бэка)
const PROJECTS = [
  { id: "p1", label: "Работа", color: "#3B82F6" },
  { id: "p2", label: "Дом", color: "#10B981" },
  { id: "p3", label: "Идеи", color: "#8B5CF6" },
];

interface SidebarProps {
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
}

const Sidebar = ({ activeFilter, onFilterChange }: SidebarProps) => {
  const logout = useLogout();

  return (
    <aside className="sidebar">
      {/* Логотип */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <CheckSquare className="sidebar__logo-icon" size={24} />
          <span>TaskFlow</span>{" "}
          {/* Можешь вернуть Todo, но так звучит круче :) */}
        </div>
      </div>

      {/* Основная навигация */}
      <div className="sidebar__scrollable">
        <nav className="sidebar__nav">
          {FILTERS.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                className={`sidebar__link ${activeFilter === filter.id ? "sidebar__link--active" : ""}`}
                onClick={() => onFilterChange(filter.id)}
              >
                <Icon size={18} className="sidebar__link-icon" />
                <span>{filter.label}</span>
                {/* Опционально: можно добавить бейджи с количеством задач */}
                {filter.id === "today" && (
                  <span className="sidebar__badge">3</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Секция Проектов */}
        <div className="sidebar__projects">
          <div className="sidebar__projects-header">
            <span>Мои списки</span>
            <button className="sidebar__add-project">
              <Plus size={16} />
            </button>
          </div>
          <nav className="sidebar__nav">
            {PROJECTS.map((project) => (
              <button
                key={project.id}
                className={`sidebar__link ${activeFilter === project.id ? "sidebar__link--active" : ""}`}
                onClick={() => onFilterChange(project.id)}
              >
                <Folder
                  size={18}
                  className="sidebar__link-icon"
                  style={{ color: project.color }}
                />
                <span>{project.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Футер сайдбара (Пользователь и Выход) */}
      <div className="sidebar__footer">
        <button className="sidebar__link">
          <Settings size={18} className="sidebar__link-icon" />
          <span>Настройки</span>
        </button>
        <button className="sidebar__logout" onClick={logout}>
          <LogOut size={18} className="sidebar__link-icon" />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
