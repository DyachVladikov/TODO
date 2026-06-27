import { useState } from "react";
import { useLogin, useRegistration } from "@/hooks/useApi";
import { usePageTransition } from "@/context/TransitionContext";

export const useAuthForm = () => {
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

  return {
    isLogin,
    login,
    setLogin,
    password,
    setPassword,
    isPending,
    error,
    handleSubmit,
    handleSwitch,
  };
};
