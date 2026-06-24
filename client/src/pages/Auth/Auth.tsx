import "./Auth.scss";
import AuthForm from "@/components/AuthForm";
import AuthDeco from "@/components/AuthDeco";
import { useEffect, useState } from "react";
import { useTelegramAuth } from "@/hooks/useApi";
import { usePageTransition } from "@/context/TransitionContext";
import QrLoginModal from "@/components/QrLoginModal";

const Auth = () => {
  const { startTransition } = usePageTransition();
  const {
    mutate: telegramLogin,
    isPending: isTelegramLoading,
    isError,
  } = useTelegramAuth();

  // Состояние для управления видимостью модального окна
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

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

  const handleQrSuccess = (token: string) => {
    // Сохраняем токен, который выдал бэкенд после сканирования
    localStorage.setItem("token", token);
    setIsQrModalOpen(false); // Закрываем модалку
    startTransition("/home"); // Летим к задачам
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
            gap: "16px",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              gap: "12px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "var(--color-border-subtle)",
              }}
            ></div>
            <span
              style={{ color: "var(--color-text-muted)", fontSize: "14px" }}
            >
              или
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "var(--color-border-subtle)",
              }}
            ></div>
          </div>

          <button
            onClick={() => setIsQrModalOpen(true)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#2AABEE",
              color: "white",
              border: "none",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Войти по QR-коду
          </button>
        </div>
      </div>
      <div className="auth__deco-col">
        <AuthDeco />
      </div>

      {isQrModalOpen && (
        <QrLoginModal
          botUsername="do_now_manager_bot"
          onClose={() => setIsQrModalOpen(false)}
          onSuccess={handleQrSuccess}
        />
      )}
    </div>
  );
};

export default Auth;
