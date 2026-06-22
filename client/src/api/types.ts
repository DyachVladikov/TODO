export interface AuthPayload {
  login: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface User {
  _id: string;
  login: string;
  createdAt: string;
  updatedAt: string;
}

export type Priority = "low" | "medium" | "high";

export interface CheckListItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string; // Фронтендовый ID (отображенный из _id)
  _id: string; // Серверный ID
  title: string;
  completed: boolean;
  important: boolean;
  createdAt: string; // Дата как строка
  updatedAt: string;
  notes?: string;
  priority: Priority;
  deadline?: string; // Дата как строка
  projectId: string;
  tags?: string[]; // Массив тегов
  checkList?: CheckListItem[]; // Массив подзадач
}

// Тип для создания/обновления (отправки на бэк)
export type TaskPayload = Partial<
  Omit<Task, "id" | "_id" | "createdAt" | "updatedAt">
>;
export interface Folder {
  id: string;
  _id: string;
  name: string;
  userId: string;
}
