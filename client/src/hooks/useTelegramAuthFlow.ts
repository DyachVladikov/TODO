import { useEffect, useRef, useState } from "react";
import type { AuthResponse } from "@/api/types";
import { useTelegramAuth } from "@/hooks/useApi";
import { usePageTransition } from "@/context/TransitionContext";

// Авто-вход через Telegram WebApp + состояние модалки QR-входа
export const useTelegramAuthFlow = () => {
  const { startTransition } = usePageTransition();
  const { mutate: telegramLogin, isError } = useTelegramAuth();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [tgErrorText, setTgErrorText] = useState<string | null>(null);
  const hasAttempted = useRef(false);

  const tg = window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;

  // Если платформа отлична от 'unknown' — приложение открыто внутри Telegram
  const isTelegramApp = Boolean(tg && tg.platform && tg.platform !== "unknown");
  const hasToken = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    if (hasToken) {
      startTransition("/home");
      return;
    }

    tg?.ready();

    if (isTelegramApp && tgUser && !hasAttempted.current) {
      hasAttempted.current = true;

      telegramLogin(
        {
          telegramId: String(tgUser.id),
          first_name: tgUser.first_name,
          username: tgUser.username,
        },
        {
          onSuccess: (data: AuthResponse) => {
            const token =
              data?.token || (typeof data === "string" ? data : null);
            if (token) {
              localStorage.setItem("token", token);
              startTransition("/home");
            } else {
              setTgErrorText("Авторизация прошла, но бэкенд не выдал токен.");
            }
          },
          onError: (err: Error) => {
            console.error("Ошибка TG:", err);
            const errorMsg =
              (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ||
              err.message ||
              "Ошибка сервера";
            setTgErrorText(errorMsg);
          },
        },
      );
    }
  }, [hasToken, isTelegramApp, tgUser, telegramLogin, startTransition, tg]);

  const handleQrSuccess = (token: string) => {
    localStorage.setItem("token", token);
    setIsQrModalOpen(false);
    startTransition("/home");
  };

  return {
    isQrModalOpen,
    setIsQrModalOpen,
    tgErrorText,
    isError,
    isTelegramApp,
    handleQrSuccess,
  };
};
