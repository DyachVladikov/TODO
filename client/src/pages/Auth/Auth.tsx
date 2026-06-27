import "./Auth.scss";
import AuthForm from "@/components/AuthForm";
import AuthDeco from "@/components/AuthDeco";
import QrLoginModal from "@/components/QrLoginModal";
import { useTelegramAuthFlow } from "@/hooks/useTelegramAuthFlow";

const Auth = () => {
  const {
    isQrModalOpen,
    setIsQrModalOpen,
    tgErrorText,
    isError,
    isTelegramApp,
    handleQrSuccess,
  } = useTelegramAuthFlow();

  // === 1. ВЕТКА ДЛЯ TELEGRAM APP ===
  // Если мы внутри ТГ, обычная форма не должна существовать в принципе.
  if (isTelegramApp) {
    if (isError || tgErrorText) {
      return (
        <div className="auth-tg auth-tg--error">
          <h2>❌ Ошибка входа</h2>
          <code className="auth-tg__code">
            {tgErrorText || "Ошибка сети или сервера"}
          </code>
          <button
            className="auth-tg__retry"
            onClick={() => window.location.reload()}
          >
            Повторить
          </button>
        </div>
      );
    }

    // Пока идет запрос или если юзер еще подгружается — показываем лоадер
    return (
      <div className="auth-tg auth-tg--loading">
        <h2>Авторизация в TaskFlow...</h2>
      </div>
    );
  }

  // === 2. ВЕТКА ДЛЯ ОБЫЧНОГО БРАУЗЕРА (ПК / Safari / Chrome) ===
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
