import "./Auth.scss";
import AuthForm from "@/components/AuthForm";
import AuthDeco from "@/components/AuthDeco";
import { useEffect } from "react";
import { useTelegramAuth } from "@/hooks/useApi";

const Auth = () => {
  const { mutate: telegramLogin, isPending: isTelegramLoading } =
    useTelegramAuth();

  useEffect(() => {
    // Получаем объект Телеграма
    const tg = window.Telegram?.WebApp;
    tg?.ready(); // Говорим Телеграму, что приложение готово и можно его красиво показать

    const tgUser = tg?.initDataUnsafe?.user;

    // ВАЖНО: Делаем запрос только если мы в ТГ и у нас ЕЩЕ НЕТ токена,
    // чтобы не спамить бэкенд при каждом обновлении страницы
    if (tgUser && !localStorage.getItem("token")) {
      telegramLogin({
        telegramId: String(tgUser.id),
        first_name: tgUser.first_name,
        username: tgUser.username,
      });
    }
  }, [telegramLogin]);

  // Пока идет автоматический вход через ТГ, можем показать красивый экран загрузки
  // (чтобы юзер не успел увидеть форму с логином и паролем)
  if (isTelegramLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "var(--color-accent-primary)",
        }}
      >
        <h2>Заходим через Telegram...</h2>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="auth__form-col">
        <AuthForm />
      </div>
      <div className="auth__deco-col">
        <AuthDeco />
      </div>
    </div>
  );
};

export default Auth;
