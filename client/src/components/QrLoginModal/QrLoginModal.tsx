import { QRCodeCanvas } from "qrcode.react";
import { X } from "lucide-react";
import { useQrLogin } from "@/hooks/useQrLogin";
import "./QrLoginModal.scss";

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
  const { sessionId, status, telegramLink } = useQrLogin({
    botUsername,
    onSuccess,
  });

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
