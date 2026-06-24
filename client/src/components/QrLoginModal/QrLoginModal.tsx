import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react"; // Используем иконку крестика, она у тебя уже есть

interface QrLoginModalProps {
  botUsername: string;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

const QrLoginModal = ({
  botUsername,
  onClose,
  onSuccess,
}: QrLoginModalProps) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "loading" | "waiting" | "success" | "error"
  >("loading");

  useEffect(() => {
    // 1. При открытии модалки запрашиваем новый ID сессии
    const fetchSession = async () => {
      try {
        // ВАЖНО: Замени на свой реальный адрес бэкенда!
        const res = await fetch(
          "https://todo-five-lovat-55.vercel.app/api/auth/qr/generate",
        );
        const data = await res.json();
        setSessionId(data.sessionId);
        setStatus("waiting");
      } catch (err) {
        setStatus("error");
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    // 2. Начинаем пуллинг (опрос сервера) каждые 2 секунды
    if (status !== "waiting" || !sessionId) return;

    const interval = setInterval(async () => {
      try {
        // ВАЖНО: Замени на свой реальный адрес бэкенда!
        const res = await fetch(
          `https://todo-five-lovat-55.vercel.app/api/auth/qr/check/${sessionId}`,
        );
        const data = await res.json();

        if (data.status === "completed" && data.token) {
          clearInterval(interval);
          setStatus("success");
          onSuccess(data.token); // Передаем токен наверх, чтобы пустить юзера
        } else if (data.status === "expired") {
          clearInterval(interval);
          setStatus("error");
        }
      } catch (err) {
        console.error("Ошибка проверки статуса");
      }
    }, 2000);

    return () => clearInterval(interval); // Очищаем интервал при закрытии окна
  }, [sessionId, status, onSuccess]);

  // Генерируем deep link для Телеграма
  const telegramLink = `https://t.me/${botUsername}?start=login_${sessionId}`;

  return (
    <div style={overlayStyle}>
      <div style={contentStyle}>
        <button onClick={onClose} style={closeBtnStyle}>
          <X size={24} />
        </button>

        <h2
          style={{ margin: "0 0 16px 0", color: "var(--color-text-primary)" }}
        >
          Вход через Telegram
        </h2>
        <p
          style={{
            margin: "0 0 24px 0",
            color: "var(--color-text-secondary)",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          Отсканируйте этот код камерой телефона
        </p>

        {status === "loading" && (
          <p style={{ color: "var(--color-accent-primary)" }}>
            Генерируем код...
          </p>
        )}
        {status === "error" && (
          <p style={{ color: "var(--color-status-error)" }}>
            Ошибка или сессия истекла. Закройте окно и попробуйте снова.
          </p>
        )}
        {status === "success" && (
          <p
            style={{ color: "var(--color-status-success)", fontWeight: "bold" }}
          >
            Успешно! Выполняется вход...
          </p>
        )}

        {status === "waiting" && sessionId && (
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "12px",
              display: "inline-block",
            }}
          >
            {/* Отрисовка самого QR-кода */}
            <QRCodeSVG value={telegramLink} size={200} />
          </div>
        )}
      </div>
    </div>
  );
};

// Простые стили, чтобы модалка сразу выглядела поверх всего сайта (потом можешь перенести в SCSS)
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.7)",
  zIndex: 9999,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backdropFilter: "blur(4px)",
};

const contentStyle: React.CSSProperties = {
  backgroundColor: "var(--color-surface-1)",
  padding: "32px",
  borderRadius: "16px",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  border: "1px solid var(--color-border-subtle)",
  minWidth: "300px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
};

const closeBtnStyle: React.CSSProperties = {
  position: "absolute",
  top: "16px",
  right: "16px",
  background: "none",
  border: "none",
  color: "var(--color-text-muted)",
  cursor: "pointer",
};

export default QrLoginModal;
