import "./Auth.scss";
import AuthForm from "@/components/AuthForm";
import AuthDeco from "@/components/AuthDeco";
import { useEffect } from "react";
import { useTelegramAuth } from "@/hooks/useApi";
import { usePageTransition } from "@/context/TransitionContext";
import TelegramLoginButton from "@/components/TelegramLoginButton"; // ИМПОРТ КНОПКИ

const Auth = () => {
  const { startTransition } = usePageTransition();
  const {
    mutate: telegramLogin,
    isPending: isTelegramLoading,
    isError,
  } = useTelegramAuth();

  // 1. ЭТО СРАБОТАЕТ, ЕСЛИ МЫ ОТКРЫЛИ ПРИЛОЖЕНИЕ ВНУТРИ ТЕЛЕГРАМА (Мобилка)
  useEffect(() => {
    if (localStorage.getItem("token")) {
      startTransition("/home");
      return;
    }

    const tg = window.Telegram?.WebApp;
    tg?.ready();

    const tgUser = tg?.initDataUnsafe?.user;

    if (tgUser && !localStorage.getItem("token")) {
      telegramLogin(
        {
          telegramId: String(tgUser.id),
          first_name: tgUser.first_name,
          username: tgUser.username,
        },
        {
          onSuccess: () => startTransition("/home"),
          onError: (err: any) => console.error("Ошибка TG:", err),
        },
      );
    }
  }, [telegramLogin, startTransition]);

  // 2. ЭТО СРАБОТАЕТ, ЕСЛИ ЮЗЕР НАЖАЛ КНОПКУ ТГ В ОБЫЧНОМ БРАУЗЕРЕ (Десктоп)
  const handleWebTelegramLogin = (user: any) => {
    telegramLogin(
      {
        telegramId: String(user.id),
        first_name: user.first_name,
        username: user.username,
      },
      {
        onSuccess: () => startTransition("/home"),
        onError: (err: any) => console.error("Ошибка TG Web:", err),
      },
    );
  };

  if (isError) {
    return (
      <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
        <h2>❌ Ошибка входа через ТГ</h2>
        <p>Пожалуйста, обновите страницу или попробуйте войти по логину.</p>
      </div>
    );
  }

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
        <h2>Авторизация...</h2>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="auth__form-col">
        <AuthForm />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "24px",
            gap: "12px",
          }}
        >
          <span style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Или войдите через Telegram
          </span>
          <TelegramLoginButton
            botName="do_now_manager_bot"
            onAuth={handleWebTelegramLogin}
          />
        </div>
      </div>
      <div className="auth__deco-col">
        <AuthDeco />
      </div>
    </div>
  );
};

export default Auth;
