import "./Auth.scss";
import AuthForm from "@/components/AuthForm";
import AuthDeco from "@/components/AuthDeco";
import { useEffect } from "react";
import { useTelegramAuth } from "@/hooks/useApi";
import { usePageTransition } from "@/context/TransitionContext";

const Auth = () => {
  const { startTransition } = usePageTransition();
  const {
    mutate: telegramLogin,
    isPending: isTelegramLoading,
    isError,
  } = useTelegramAuth();

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
          onSuccess: () => {
            startTransition("/home");
          },
          onError: (err: any) => {
            console.error("Ошибка TG:", err);
          },
        },
      );
    }
  }, [telegramLogin, startTransition]);

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
      </div>
      <div className="auth__deco-col">
        <AuthDeco />
      </div>
    </div>
  );
};

export default Auth;
