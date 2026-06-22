import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { Folder } from "@/api/types";

export const useFolders = () => {
  const queryClient = useQueryClient();

  const { data: folders = [] } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const data = await api.get<any[]>("/folders");
      return data.map((folder: any) => ({
        ...folder,
        id: folder._id,
      })) as Folder[];
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: (name: string) => api.post<Folder>("/folders", { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["folders"] }),
  });

  // НОВАЯ МУТАЦИЯ ДЛЯ УДАЛЕНИЯ
  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/folders/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["folders"] }),
  });

  return {
    folders,
    addFolder: (name: string) => createFolderMutation.mutate(name),
    deleteFolder: (id: string) => deleteFolderMutation.mutate(id), // Отдаем функцию наружу
    isAdding: createFolderMutation.isPending,
  };
};
