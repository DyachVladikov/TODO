import "./AuthForm.scss";
import { useAuthForm } from "@/hooks/useAuthForm";

const AuthForm = () => {
  const {
    isLogin,
    login,
    setLogin,
    password,
    setPassword,
    isPending,
    error,
    handleSubmit,
    handleSwitch,
  } = useAuthForm();

  return (
    <>
      <div className="auth-form">
        <h1 className="auth-form__title">{isLogin ? `Вход` : "Регистрация"}</h1>
        <p className="auth-form__subtitle">
          {isLogin ? "Рады видеть тебя снова" : "Создай свой аккаунт"}
        </p>

        <form className="auth-form__body" onSubmit={handleSubmit}>
          <div className="auth-form__field">
            <label>Логин</label>
            <input
              type="text"
              placeholder="Ваш логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div className="auth-form__field">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="auth-form__error">{(error as Error).message}</p>
          )}

          <button
            type="submit"
            className="auth-form__submit"
            disabled={isPending}
          >
            {isPending
              ? "Загрузка..."
              : isLogin
                ? "Войти"
                : "Зарегистрироваться"}
          </button>
        </form>

        <p className="auth-form__switch">
          {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
          <button type="button" onClick={handleSwitch}>
            {isLogin ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>
      </div>
    </>
  );
};

export default AuthForm;
