import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X } from "lucide-react";
import "./QrLoginModal.scss"; // Подключаем наши стили

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
    const fetchSession = async () => {
      try {
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
    if (status !== "waiting" || !sessionId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `https://todo-five-lovat-55.vercel.app/api/auth/qr/check/${sessionId}`,
        );
        const data = await res.json();
        if (data.status === "completed" && data.token) {
          clearInterval(interval);
          setStatus("success");
          onSuccess(data.token);
        } else if (data.status === "expired") {
          clearInterval(interval);
          setStatus("error");
        }
      } catch (err) {
        console.error("Ошибка проверки статуса");
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [sessionId, status, onSuccess]);

  const telegramLink = `https://t.me/${botUsername}?start=login_${sessionId}`;

  return (
    <div className="qr-modal__overlay">
      <div className="qr-modal__content">
        <button onClick={onClose} className="qr-modal__close">
          <X size={20} />
        </button>

        <h2 className="qr-modal__title">Вход через Telegram</h2>
        <p className="qr-modal__subtitle">
          Отсканируйте код камерой вашего телефона
        </p>

        {status === "waiting" && sessionId && (
          <div className="qr-modal__qr-wrapper">
            <QRCodeCanvas
              value={telegramLink}
              size={180}
              fgColor="#000000"
              bgColor="#FFFFFF"
              style={{ display: "block" }}
            />
          </div>
        )}

        {status === "loading" && (
          <p className="qr-modal__status qr-modal__status--loading">
            Генерируем код...
          </p>
        )}
        {status === "error" && (
          <p className="qr-modal__status qr-modal__status--error">
            Сессия истекла. Попробуйте снова.
          </p>
        )}
        {status === "success" && (
          <p className="qr-modal__status qr-modal__status--success">
            Успешно! Входим...
          </p>
        )}
      </div>
    </div>
  );
};

export default QrLoginModal;
