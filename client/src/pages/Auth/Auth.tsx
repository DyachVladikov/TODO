import "./Auth.scss";
import AuthForm from "@/components/AuthForm";
import AuthDeco from "@/components/AuthDeco";
import { useEffect, useState } from "react";
// useNavigate удален!
import { useTelegramAuth } from "@/hooks/useApi";
import { usePageTransition } from "@/context/TransitionContext";

const Auth = () => {
  const { startTransition } = usePageTransition();
  const {
    mutate: telegramLogin,
    isPending: isTelegramLoading,
    isError,
  } = useTelegramAuth();

  const [debugMsg, setDebugMsg] = useState("Ждем Telegram...");

  useEffect(() => {
    /* if (localStorage.getItem("token")) {
      startTransition("/home");
      return;
    } */

    const tg = window.Telegram?.WebApp;
    tg?.ready();

    const tgUser = tg?.initDataUnsafe?.user;

    if (tgUser) {
      setDebugMsg(`Телеграм найден! ID: ${tgUser.id}. Отправляем запрос...`);
      telegramLogin(
        {
          telegramId: String(tgUser.id),
          first_name: tgUser.first_name,
          username: tgUser.username,
        },
        {
          onSuccess: () => {
            setDebugMsg("Успех! Переходим...");
            startTransition("/home");
          },
          onError: (err: any) => {
            setDebugMsg(
              `Бэкенд вернул ошибку: ${err?.message || "Неизвестная ошибка"}`,
            );
          },
        },
      );
    } else {
      setDebugMsg("Телеграм не найден, показываем обычный вход.");
    }
  }, [telegramLogin, startTransition]); // Обновили зависимости

  if (isError) {
    return (
      <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
        <h2>❌ Ошибка входа через ТГ</h2>
        <p>{debugMsg}</p>
        <p>Иди в логи Vercel (Сервер) и смотри причину!</p>
      </div>
    );
  }

  if (isTelegramLoading || debugMsg.includes("Отправляем")) {
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
        <h2>{debugMsg}</h2>
      </div>
    );
  }

  const handleForceLogout = () => {
    localStorage.removeItem("token");
    window.location.reload(); // Перезагрузит страницу с чистым localStorage
  };

  return (
    <div className="auth" style={{ position: "relative" }}>
      {/* Кнопка будет висеть в самом верху экрана */}
      <button
        onClick={handleForceLogout}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 9999,
          padding: "5px 10px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        ⚠️ Сбросить токен
      </button>

      <div className="auth__form-col">
        <AuthForm />
      </div>
      <div className="auth__deco-col">
        <AuthDeco />
      </div>
    </div>
  );

  /* return (
    <div className="auth">
      <div className="auth__form-col">
        <AuthForm />
      </div>
      <div className="auth__deco-col">
        <AuthDeco />
      </div>
    </div>
  ); */
};

export default Auth;
