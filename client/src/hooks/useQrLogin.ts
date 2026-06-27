import { useEffect, useState } from "react";

const QR_API_BASE = "https://todo-five-lovat-55.vercel.app/api/auth/qr";

type QrStatus = "loading" | "waiting" | "success" | "error";

interface UseQrLoginParams {
  botUsername: string;
  onSuccess: (token: string) => void;
}

// Генерирует QR-сессию и опрашивает её статус до завершения входа
export const useQrLogin = ({ botUsername, onSuccess }: UseQrLoginParams) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<QrStatus>("loading");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${QR_API_BASE}/generate`);
        const data = await res.json();
        setSessionId(data.sessionId);
        setStatus("waiting");
      } catch {
        setStatus("error");
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (status !== "waiting" || !sessionId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${QR_API_BASE}/check/${sessionId}`);
        const data = await res.json();
        if (data.status === "completed" && data.token) {
          clearInterval(interval);
          setStatus("success");
          onSuccess(data.token);
        } else if (data.status === "expired") {
          clearInterval(interval);
          setStatus("error");
        }
      } catch {
        console.error("Ошибка проверки статуса");
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [sessionId, status, onSuccess]);

  const telegramLink = `https://t.me/${botUsername}?start=login_${sessionId}`;

  return { sessionId, status, telegramLink };
};
