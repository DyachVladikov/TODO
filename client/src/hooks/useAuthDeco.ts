import { useEffect, useRef, useState } from "react";
import { getCardStyle, type DecoPhase } from "@/utils/authDeco";

// Управляет циклической анимацией декоративной сцены (фаза, размеры, адаптив)
export const useAuthDeco = () => {
  const [phase, setPhase] = useState<DecoPhase>("idle");
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [size, setSize] = useState({ w: 400, h: 600 });
  const sceneRef = useRef<HTMLDivElement>(null);

  // Появление сцены после монтирования
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Отслеживание узкого экрана (<=1280px)
  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth <= 1280);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Реальные размеры сцены для расчёта смещений карточек
  useEffect(() => {
    const update = () => {
      if (sceneRef.current) {
        setSize({
          w: sceneRef.current.offsetWidth,
          h: sceneRef.current.offsetHeight,
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (sceneRef.current) ro.observe(sceneRef.current);
    return () => ro.disconnect();
  }, []);

  // Бесконечный цикл: пауза → разлёт → удержание → схлопывание
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const cycle = () => {
      t = setTimeout(() => {
        setPhase("expand");
        setExpanded(true);
        t = setTimeout(() => {
          setPhase("collapse");
          t = setTimeout(() => {
            setExpanded(false);
            setPhase("idle");
            cycle();
          }, 900);
        }, 4500);
      }, 8000);
    };
    cycle();
    return () => clearTimeout(t);
  }, []);

  const getStyle = (idx: number) =>
    getCardStyle(idx, { isNarrow, size, phase, expanded });

  return { sceneRef, phase, mounted, getStyle };
};
