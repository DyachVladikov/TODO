import { useState } from "react";
import "./AuthForm.scss";
import { useLogin, useRegistration } from "@/hooks/useApi";
import { usePageTransition } from "@/context/TransitionContext";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const { startTransition } = usePageTransition();

  const {
    mutate: loginMutate,
    isPending: loginPending,
    error: loginError,
  } = useLogin();
  const {
    mutate: registerMutate,
    isPending: registerPending,
    error: registerError,
  } = useRegistration();

  const isPending = loginPending || registerPending;
  const error = loginError || registerError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { login, password };
    const onSuccess = () => startTransition("/home");

    if (isLogin) {
      loginMutate(payload, { onSuccess });
    } else {
      registerMutate(payload, { onSuccess });
    }
  };

  const handleSwitch = () => {
    setIsLogin(!isLogin);
    setLogin("");
    setPassword("");
  };

  return (
    <>
      <div className="auth-form">
        <h1 className="auth-form__title">{isLogin ? "Вход" : "Регистрация"}</h1>
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
