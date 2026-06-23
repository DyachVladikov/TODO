import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { AuthPayload, AuthResponse, User } from "@/api/types";
import { useNavigate } from "react-router-dom";

export const useRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AuthPayload) =>
      api.post<AuthResponse>("/auth/registration", payload),
    onSuccess: ({ token }) => {
      localStorage.setItem("token", token);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AuthPayload) =>
      api.post<AuthResponse>("/auth/login", payload),
    onSuccess: ({ token }) => {
      localStorage.setItem("token", token);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};

export const useTelegramAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      telegramId: string;
      first_name?: string;
      username?: string;
    }) => api.post<AuthResponse>("/auth/telegram", payload),
    onSuccess: ({ token }) => {
      localStorage.setItem("token", token);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<User>("/auth/me"),
    enabled: !!localStorage.getItem("token"),
    retry: false,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    localStorage.removeItem("token");
    queryClient.clear();
    navigate("/", { replace: true });
  };
};
