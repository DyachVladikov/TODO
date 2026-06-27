// Праздничные дни РФ в формате MM-DD
export const RUSSIAN_HOLIDAYS = [
  "01-01",
  "01-02",
  "01-03",
  "01-04",
  "01-05",
  "01-06",
  "01-07",
  "01-08",
  "02-23",
  "03-08",
  "05-01",
  "05-09",
  "06-12",
  "11-04",
];

export const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const isHoliday = (month: number, day: number): boolean => {
  const key = `${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return RUSSIAN_HOLIDAYS.includes(key);
};

// Сетка месяца: сколько пустых ячеек в начале (Пн — первый день) и сколько дней
export const getMonthGrid = (year: number, month: number) => {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  return {
    startPadding: (firstDayOfMonth.getDay() + 6) % 7,
    daysInMonth: lastDayOfMonth.getDate(),
  };
};

// С какой стороны открывать боковую панель (зависит от колонки дня в неделе)
export const getPanelPositionClass = (dateKey: string) => {
  const [y, m, d] = dateKey.split("-").map(Number);
  const col = (new Date(y, m - 1, d).getDay() + 6) % 7;
  return col <= 3 ? "side-panel--right" : "side-panel--left";
};
