import "./Auth.scss";
import AuthForm from "@/components/AuthForm";
import AuthDeco from "@/components/AuthDeco";
import { useEffect, useState, useRef } from "react";
import { useTelegramAuth } from "@/hooks/useApi";
import { usePageTransition } from "@/context/TransitionContext";
import QrLoginModal from "@/components/QrLoginModal";

const Auth = () => {
  const { startTransition } = usePageTransition();
  const { mutate: telegramLogin, isError } = useTelegramAuth();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [tgErrorText, setTgErrorText] = useState<string | null>(null);
  const hasAttempted = useRef(false);

  const tg = window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;

  // Если платформа отлична от 'unknown', значит приложение 100% открыто внутри Telegram
  const isTelegramApp = tg && tg.platform && tg.platform !== "unknown";
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
          onSuccess: (data: any) => {
            const token =
              data?.token || (typeof data === "string" ? data : null);
            if (token) {
              localStorage.setItem("token", token);
              startTransition("/home");
            } else {
              setTgErrorText("Авторизация прошла, но бэкенд не выдал токен.");
            }
          },
          onError: (err: any) => {
            console.error("Ошибка TG:", err);
            const errorMsg =
              err?.response?.data?.message || err.message || "Ошибка сервера";
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

  // === 1. ВЕТКА ДЛЯ TELEGRAM APP ===
  // Если мы внутри ТГ, обычная форма не должна существовать в принципе.
  if (isTelegramApp) {
    if (isError || tgErrorText) {
      return (
        <div
          style={{
            padding: "20px",
            color: "var(--color-status-error)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <h2>❌ Ошибка входа</h2>
          <code
            style={{
              background: "var(--color-surface-2)",
              padding: "10px",
              borderRadius: "8px",
              marginTop: "10px",
              wordBreak: "break-word",
            }}
          >
            {tgErrorText || "Ошибка сети или сервера"}
          </code>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: "var(--color-surface-3)",
              color: "white",
              cursor: "pointer",
            }}
          >
            Повторить
          </button>
        </div>
      );
    }

    // Пока идет запрос или если юзер еще подгружается — показываем лоадер
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "var(--color-accent-primary)",
          background: "var(--color-surface-1)",
        }}
      >
        <h2>Авторизация в TaskFlow...</h2>
      </div>
    );
  }

  // === 2. ВЕТКА ДЛЯ ОБЫЧНОГО БРАУЗЕРА (ПК / Safari / Chrome) ===
  // Сюда код дойдет только если isTelegramApp === false
  return (
    <div className="auth">
      <div className="auth__form-col">
        <AuthForm />
        <div className="auth__qr-section">
          <div className="auth__divider">
            <span>или</span>
          </div>

          <button
            className="auth__qr-btn"
            onClick={() => setIsQrModalOpen(true)}
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
