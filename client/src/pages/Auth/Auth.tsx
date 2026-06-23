import "./Auth.scss";
import AuthForm from "@/components/AuthForm";
import AuthDeco from "@/components/AuthDeco";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 1. Импортируем хук
import { useTelegramAuth } from "@/hooks/useApi";

const Auth = () => {
  const navigate = useNavigate();
  const { mutate: telegramLogin, isPending: isTelegramLoading } =
    useTelegramAuth();

  // 3. Дополнительно проверяем наличие токена при загрузке страницы
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/home");
    }
    console.log(isTelegramLoading);
  }, [navigate]);

  useEffect(() => {
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
          // 4. Отрабатываем успех внутри мутации
          onSuccess: () => navigate("/home"),
        },
      );
    }
  }, [telegramLogin, navigate]);

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
