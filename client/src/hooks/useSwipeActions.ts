import { useRef, useState } from "react";
import type { Task } from "@/api/types";
import { triggerHaptic } from "@/utils/haptics";

const THRESHOLD = 100;
const MAX_DRAG = 130; // Жесткий ограничитель, чтобы карточка не улетала слишком далеко

interface UseSwipeActionsParams {
  task: Task;
  onToggleStatus: () => void;
  onDelete: () => void;
}

export const useSwipeActions = ({
  task,
  onToggleStatus,
  onDelete,
}: UseSwipeActionsParams) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const bgCompleteRef = useRef<HTMLDivElement>(null);
  const bgDeleteRef = useRef<HTMLDivElement>(null);

  const touchStartX = useRef<number | null>(null);
  const currentOffset = useRef<number>(0);
  const hasVibrated = useRef<boolean>(false);

  const [toastType, setToastType] = useState<"completed" | "deleted" | null>(
    null,
  );

  const resetPosition = () => {
    currentOffset.current = 0;
    if (itemRef.current) {
      itemRef.current.style.transform = `translateX(0px)`;
      itemRef.current.style.borderColor = "";
    }

    if (bgCompleteRef.current) {
      bgCompleteRef.current.style.transition = "opacity 0.3s ease";
      bgCompleteRef.current.style.opacity = "0";
      setTimeout(() => {
        if (bgCompleteRef.current)
          bgCompleteRef.current.style.transition = "none";
      }, 300);
    }
    if (bgDeleteRef.current) {
      bgDeleteRef.current.style.transition = "opacity 0.3s ease";
      bgDeleteRef.current.style.opacity = "0";
      setTimeout(() => {
        if (bgDeleteRef.current) bgDeleteRef.current.style.transition = "none";
      }, 300);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (toastType) return;

    touchStartX.current = e.touches[0].clientX;
    hasVibrated.current = false;

    if (itemRef.current) {
      itemRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const offset = e.touches[0].clientX - touchStartX.current;
    currentOffset.current = offset;

    let visualOffset = offset;

    // ПОДЕРГИВАНИЕ: Если задача выполнена и мы тянем вправо
    if (task.completed && offset > 0) {
      visualOffset = offset * 0.15; // Очень тугое сопротивление
      visualOffset = Math.min(visualOffset, 25); // Запрещаем тянуть дальше 25px
    } else {
      // Обычная логика резинового сопротивления для остальных действий
      if (offset > THRESHOLD) {
        visualOffset = THRESHOLD + (offset - THRESHOLD) * 0.25;
      } else if (offset < -THRESHOLD) {
        visualOffset = -THRESHOLD + (offset + THRESHOLD) * 0.25;
      }
      // Ограничиваем максимальную оттяжку
      visualOffset = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, visualOffset));
    }

    if (itemRef.current) {
      itemRef.current.style.transform = `translateX(${visualOffset}px)`;

      // Красим рамку только если это не подергивание
      if (!(task.completed && offset > 0)) {
        const ratio = Math.min(Math.abs(visualOffset) / THRESHOLD, 1);
        if (offset > 0) {
          itemRef.current.style.borderColor = `rgba(16, 185, 129, ${ratio})`;
        } else {
          itemRef.current.style.borderColor = `rgba(239, 68, 68, ${ratio})`;
        }
      }
    }

    // Управление непрозрачностью фонов
    if (offset > 0 && bgCompleteRef.current && bgDeleteRef.current) {
      if (task.completed) {
        // Убираем зеленый фон при подергивании выполненной задачи
        bgCompleteRef.current.style.opacity = "0";
      } else {
        bgCompleteRef.current.style.opacity = Math.min(
          offset / THRESHOLD,
          1,
        ).toString();
      }
      bgDeleteRef.current.style.opacity = "0";
    } else if (offset < 0 && bgCompleteRef.current && bgDeleteRef.current) {
      bgDeleteRef.current.style.opacity = Math.min(
        Math.abs(offset) / THRESHOLD,
        1,
      ).toString();
      bgCompleteRef.current.style.opacity = "0";
    }

    // Логика вибрации
    if (
      Math.abs(offset) >= THRESHOLD &&
      !hasVibrated.current &&
      !(task.completed && offset > 0)
    ) {
      triggerHaptic("light");
      hasVibrated.current = true;
    } else if (Math.abs(offset) < THRESHOLD && hasVibrated.current) {
      hasVibrated.current = false;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    touchStartX.current = null;

    const offset = currentOffset.current;

    if (itemRef.current) {
      itemRef.current.style.transition =
        "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.4s ease";
    }

    // Если это выполненная задача и свайп вправо — просто возвращаем обратно
    if (task.completed && offset > 0) {
      resetPosition();
      return;
    }

    if (offset >= THRESHOLD) {
      // ВЫПОЛНЕНИЕ
      triggerHaptic("success");
      setToastType("completed");

      // Плавно скрываем зеленую подложку (по аналогии с красной ниже)
      if (bgCompleteRef.current) {
        bgCompleteRef.current.style.transition = "opacity 0.3s ease";
        bgCompleteRef.current.style.opacity = "0";
      }

      resetPosition(); // Возвращаем карточку плавно

      setTimeout(() => {
        setToastType(null);
        onToggleStatus();
      }, 800);
    } else if (offset <= -THRESHOLD) {
      // УДАЛЕНИЕ
      triggerHaptic("warning");
      setToastType("deleted");

      // Скрываем красную подложку плавно
      if (bgDeleteRef.current) {
        bgDeleteRef.current.style.transition = "opacity 0.3s ease";
        bgDeleteRef.current.style.opacity = "0";
      }

      // Улетает за экран карточка задачи
      if (itemRef.current) {
        itemRef.current.style.transform = `translateX(-150vw)`;
        itemRef.current.style.borderColor = `rgba(239, 68, 68, 1)`;
      }

      setTimeout(() => {
        setToastType(null);
        onDelete();
      }, 800);
    } else {
      resetPosition();
    }
  };

  return {
    itemRef,
    bgCompleteRef,
    bgDeleteRef,
    toastType,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
