import { useEffect, useRef } from "react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginButtonProps {
  botName: string; // Имя твоего бота без @
  onAuth: (user: TelegramUser) => void;
}

const TelegramLoginButton = ({ botName, onAuth }: TelegramLoginButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Создаем глобальную функцию, которую вызовет скрипт Телеграма после логина
    (window as any).onTelegramAuth = (user: TelegramUser) => {
      onAuth(user);
    };

    // 2. Создаем сам тег скрипта
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8"); // Закругление краев
    script.setAttribute("data-request-access", "write"); // Разрешаем боту писать сообщения
    script.setAttribute("data-userpic", "false"); // Отключаем показ аватарки на самой кнопке
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.async = true;

    // 3. Вставляем скрипт в наш div
    if (containerRef.current) {
      containerRef.current.innerHTML = ""; // Очищаем на случай перерисовки
      containerRef.current.appendChild(script);
    }

    // 4. Убираем за собой при закрытии компонента
    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [botName, onAuth]);

  return <div ref={containerRef} className="telegram-btn-wrapper"></div>;
};

export default TelegramLoginButton;
