export const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return "Нет";
  const date = new Date(dateString);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateOnly = (dateString: string | undefined | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatTimeOnly = (dateString: string | undefined | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Ключ даты в формате YYYY-MM-DD из объекта Date (для группировки по дням)
export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Указано ли у даты конкретное время (не полночь)
export const hasSpecificTime = (
  dateString: string | undefined | null,
): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date.getHours() !== 0 || date.getMinutes() !== 0;
};

// Время дедлайна "ЧЧ:ММ" либо null, если время не задано (полночь)
export const formatDeadlineTime = (
  dateString: string | undefined | null,
): string | null => {
  if (!dateString || !hasSpecificTime(dateString)) return null;
  return new Date(dateString).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Попадает ли дата на сегодняшний день
export const isToday = (dateString: string | undefined | null): boolean => {
  if (!dateString) return false;
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Попадает ли дата в ближайшие 7 дней (начиная с сегодняшнего дня)
export const isWithinNextWeek = (
  dateString: string | undefined | null,
): boolean => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(23, 59, 59, 999);
  const date = new Date(dateString);
  return date >= today && date <= nextWeek;
};
