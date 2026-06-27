type HapticType =
  | "light"
  | "medium"
  | "rigid"
  | "success"
  | "warning"
  | "error";

// Тактильная отдача через Telegram WebApp (если приложение открыто внутри Telegram)
export const triggerHaptic = (type: HapticType) => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  if (type === "success" || type === "error" || type === "warning") {
    tg.HapticFeedback?.notificationOccurred(type);
  } else {
    tg.HapticFeedback?.impactOccurred(type);
  }
};
