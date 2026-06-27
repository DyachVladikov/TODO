import { useEffect, useState } from "react";
import type { Task, TaskPayload, CheckListItem } from "@/api/types";
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { formatDateOnly, formatTimeOnly } from "@/utils/date";

const buildDraft = (task: Task): TaskPayload => ({
  title: task.title,
  notes: task.notes || "",
  priority: task.priority,
  deadline: task.deadline,
  projectId: task.projectId,
  tags: task.tags || [],
  checkList: task.checkList || [],
  important: task.important || false,
});

type ReminderLike = number | { minutesBefore: number };

const mapReminders = (task: Task): number[] =>
  task.reminders
    ? (task.reminders as ReminderLike[]).map((r) =>
        typeof r === "number" ? r : r.minutesBefore,
      )
    : [];

export const useTaskDetails = (task: Task | null, onClose: () => void) => {
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TaskPayload | null>(null);

  const [dateDraft, setDateDraft] = useState("");
  const [timeDraft, setTimeDraft] = useState("");
  const [remindersDraft, setRemindersDraft] = useState<number[]>([]);
  const [isCustomReminderOpen, setIsCustomReminderOpen] = useState(false);

  const [newCheckLinkTitle, setNewCheckLinkTitle] = useState("");

  const resetFromTask = (source: Task) => {
    setDraft(buildDraft(source));
    setDateDraft(formatDateOnly(source.deadline));
    setTimeDraft(formatTimeOnly(source.deadline));
    setRemindersDraft(mapReminders(source));
  };

  useEffect(() => {
    if (task) {
      setIsEditing(false);
      resetFromTask(task);
      setNewCheckLinkTitle("");
    } else {
      setDraft(null);
      setIsEditing(false);
    }
  }, [task]);

  const updateDraft = (updates: Partial<TaskPayload>) => {
    setDraft((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const addReminderMinutes = (minutes: number) => {
    setRemindersDraft((prev) =>
      prev.includes(minutes) ? prev : [...prev, minutes].sort((a, b) => a - b),
    );
  };

  const handleAddReminder = (val: string) => {
    if (val === "none") return;
    if (val === "custom") {
      setIsCustomReminderOpen(true);
      return;
    }
    addReminderMinutes(Number(val));
  };

  const handleCustomReminderSave = (minutes: number) => {
    addReminderMinutes(minutes);
  };

  const handleRemoveReminder = (minutes: number) => {
    setRemindersDraft((prev) => prev.filter((m) => m !== minutes));
  };

  const handleSave = () => {
    if (!draft || !task) return;

    let formattedDeadline = "";
    if (dateDraft) {
      const time = timeDraft || "00:00";
      formattedDeadline = new Date(`${dateDraft}T${time}`).toISOString();
    }

    const payload = {
      ...draft,
      deadline: formattedDeadline,
      reminderMinutes: remindersDraft,
    };

    updateTaskMutation.mutate(
      { id: task.id, updates: payload },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleCancel = () => {
    if (!task) return;
    setIsEditing(false);
    resetFromTask(task);
  };

  const handleDeleteTask = () => {
    if (task && window.confirm("Вы уверены, что хотите удалить эту задачу?")) {
      deleteTaskMutation.mutate(task.id, {
        onSuccess: () => onClose(),
      });
    }
  };

  const toggleCheckListItem = (itemId: string) => {
    if (!isEditing || !draft) return;
    updateDraft({
      checkList: (draft.checkList || []).map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item,
      ),
    });
  };

  const addCheckListItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckLinkTitle.trim() || !draft) return;

    const newItem: CheckListItem = {
      id: Date.now().toString(),
      title: newCheckLinkTitle.trim(),
      completed: false,
    };

    updateDraft({ checkList: [...(draft.checkList || []), newItem] });
    setNewCheckLinkTitle("");
  };

  const deleteCheckListItem = (itemId: string) => {
    if (!draft) return;
    updateDraft({
      checkList: (draft.checkList || []).filter((item) => item.id !== itemId),
    });
  };

  const currentData = isEditing ? draft : task;

  return {
    // Состояние
    isEditing,
    setIsEditing,
    draft,
    dateDraft,
    setDateDraft,
    timeDraft,
    setTimeDraft,
    remindersDraft,
    isCustomReminderOpen,
    setIsCustomReminderOpen,
    newCheckLinkTitle,
    setNewCheckLinkTitle,
    // Производные данные
    currentData,
    isSaving: updateTaskMutation.isPending,
    // Обработчики
    updateDraft,
    handleAddReminder,
    handleCustomReminderSave,
    handleRemoveReminder,
    handleSave,
    handleCancel,
    handleDeleteTask,
    toggleCheckListItem,
    addCheckListItem,
    deleteCheckListItem,
  };
};
