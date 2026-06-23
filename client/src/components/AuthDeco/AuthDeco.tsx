import "./AuthDeco.scss";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "expand" | "collapse";

// Смещения для широкого экрана [x%, y%]
const OFFSETS_WIDE = [
  [-52, -42],
  [48, 40],
  [50, -48],
  [-50, 45],
  [-6, -58],
  [9, 55],
  [-62, 3],
  [58, -6],
];

// Смещения для узкого экрана (<=1280px) — вылет дальше, чтобы выйти из-за формы
const OFFSETS_NARROW = [
  [-75, -55],
  [70, 50],
  [72, -60],
  [-70, 55],
  [-5, -80],
  [8, 75],
  [-85, 3],
  [80, -5],
];

const AuthDeco = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 400, h: 600 });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth <= 1280);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    // Сообщаем Телеграму, что наше приложение готово к отрисовке
    tg?.ready();

    // Проверяем, открыт ли сайт внутри Телеграма и есть ли данные юзера
    if (tg?.initDataUnsafe?.user) {
      const user = tg.initDataUnsafe.user;
      console.log("Ого, мы в Телеграме! Привет:", user.first_name);
      console.log("Телеграм ID:", user.id);
      console.log("Юзернейм:", user.username);
    } else {
      console.log("Открыто в обычном браузере, Телеграма тут нет.");
    }
  }, []);

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

  const getStyle = (idx: number): React.CSSProperties => {
    const OFFSETS = isNarrow ? OFFSETS_NARROW : OFFSETS_WIDE;
    const [px, py] = OFFSETS[idx];
    const tx = (size.w * px) / 100;
    const ty = (size.h * py) / 100;
    const base = {
      "--tx": `${tx}px`,
      "--ty": `${ty}px`,
    } as React.CSSProperties;

    const floatAnims = [
      "float-a",
      "float-b",
      "float-a",
      "float-c",
      "float-b",
      "float-a",
      "float-c",
      "float-b",
    ];
    const floatDurs = [5.0, 6.2, 7.0, 5.5, 6.5, 4.8, 7.5, 5.2];
    const floatDels = [0, 0, 0.5, 1.0, 0.3, 0.8, 0.2, 1.2];
    const floatAnim = `${floatAnims[idx]} ${floatDurs[idx]}s ease-in-out ${floatDels[idx]}s infinite`;

    if (phase === "expand") {
      return {
        ...base,
        animation: `exp-card 1.1s cubic-bezier(0.16,1,0.3,1) ${idx * 0.09}s forwards`,
      };
    }
    if (phase === "collapse" && expanded) {
      return {
        ...base,
        animation: `col-card 0.9s cubic-bezier(0.16,1,0.3,1) ${idx * 0.07}s forwards`,
      };
    }
    if (expanded) {
      // Карточка на месте — добавляем float
      return {
        ...base,
        opacity: 1,
        transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1)`,
        animation: floatAnim,
      };
    }
    return base;
  };

  const extra = (name: string, idx: number) =>
    `auth-deco__card auth-deco__card--${name} auth-deco__card--extra ${idx}`;

  return (
    <div className="auth-deco">
      <div className="auth-deco__orb auth-deco__orb--1" />
      <div className="auth-deco__orb auth-deco__orb--2" />
      <div className="auth-deco__orb auth-deco__orb--3" />

      <div className={`auth-deco__scene`} ref={sceneRef}>
        {/* ── Главная карточка ── */}
        <div
          className="auth-deco__card auth-deco__card--main"
          style={{ opacity: !mounted ? 0 : phase !== "idle" ? 0.2 : 1 }}
        >
          <div className="auth-deco__card-header">
            <div className="auth-deco__dot auth-deco__dot--accent" />
            <div className="auth-deco__bar auth-deco__bar--short" />
            <span className="auth-deco__card-title">Todo List</span>
          </div>

          <div className="auth-deco__rows">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="auth-deco__row"
                style={{ "--i": i } as React.CSSProperties}
              >
                <div
                  className={`auth-deco__check-box${i < 4 ? " auth-deco__check-box--done" : ""}`}
                >
                  {i < 4 && (
                    <svg viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="auth-deco__row-bars">
                  <div
                    className="auth-deco__bar"
                    style={
                      {
                        width: `${48 + i * 6}%`,
                        opacity: i < 4 ? 0.38 : 1,
                      } as React.CSSProperties
                    }
                  />
                  <div
                    className="auth-deco__bar auth-deco__bar--xs"
                    style={{ width: `${28 + i * 5}%` } as React.CSSProperties}
                  />
                </div>
                <div
                  className={`auth-deco__badge auth-deco__badge--${i % 3}`}
                />
              </div>
            ))}
          </div>

          <div className="auth-deco__divider" />

          <div className="auth-deco__progress-section">
            <div className="auth-deco__progress-track">
              <div className="auth-deco__progress-fill" />
            </div>
            <div
              className="auth-deco__bar auth-deco__bar--xs"
              style={{ width: 44 }}
            />
          </div>

          <div className="auth-deco__bottom-row">
            {[0, 1, 2].map((i) => (
              <div key={i} className="auth-deco__bottom-chip" />
            ))}
          </div>
        </div>

        {/* ── Бар-чарт ── */}
        <div className={extra("chart", 0)} style={getStyle(0)}>
          <div className="auth-deco__card-header">
            <div
              className="auth-deco__bar auth-deco__bar--xs"
              style={{ width: "55%" }}
            />
          </div>
          <div className="auth-deco__chart">
            {[40, 65, 50, 80, 55, 90, 70, 60].map((h, i) => (
              <div
                key={i}
                className="auth-deco__chart-bar"
                style={{ "--h": `${h}%`, "--i": i } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        {/* ── Стат-кружки ── */}
        <div className={extra("stat", 1)} style={getStyle(1)}>
          <div className="auth-deco__stat-circles">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`auth-deco__stat-circle auth-deco__stat-circle--${i}`}
              />
            ))}
          </div>
          <div
            className="auth-deco__bar auth-deco__bar--xs"
            style={{ width: "65%" }}
          />
        </div>

        {/* ── Метрики ── */}
        <div className={extra("metrics", 2)} style={getStyle(2)}>
          <div className="auth-deco__metrics">
            {[
              ["24", "задачи"],
              ["87%", "готово"],
              ["3", "просроч."],
            ].map(([val, lbl], i) => (
              <div key={i} className="auth-deco__metric">
                <span className="auth-deco__metric-val">{val}</span>
                <span className="auth-deco__metric-lbl">{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Лоадер ── */}
        <div className={extra("loader", 3)} style={getStyle(3)}>
          <div className="auth-deco__loader-ring" />
          <div
            className="auth-deco__bar auth-deco__bar--xs"
            style={{ width: "60%" }}
          />
        </div>

        {/* ── Линейный график ── */}
        <div className={extra("linechart", 4)} style={getStyle(4)}>
          <div className="auth-deco__card-header">
            <div
              className="auth-deco__bar auth-deco__bar--xs"
              style={{ width: "45%" }}
            />
          </div>
          <svg
            className="auth-deco__line-svg"
            viewBox="0 0 120 40"
            preserveAspectRatio="none"
          >
            <polyline
              className="auth-deco__line-track"
              points="0,35 20,28 40,32 60,18 80,22 100,10 120,14"
            />
            <polyline
              className="auth-deco__line-fill"
              points="0,35 20,28 40,32 60,18 80,22 100,10 120,14 120,40 0,40"
            />
          </svg>
        </div>

        {/* ── Теги ── */}
        <div className={extra("tags", 5)} style={getStyle(5)}>
          <div className="auth-deco__tags">
            {["Работа", "Личное", "Срочно", "Идеи", "Обучение"].map((t, i) => (
              <span
                key={t}
                className={`auth-deco__tag auth-deco__tag--${i % 4}`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Хитмап ── */}
        <div className={extra("heatmap", 6)} style={getStyle(6)}>
          <div className="auth-deco__card-header">
            <div
              className="auth-deco__bar auth-deco__bar--xs"
              style={{ width: "50%" }}
            />
          </div>
          <div className="auth-deco__heatmap">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="auth-deco__heatmap-cell"
                style={{ "--level": i % 4 } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        {/* ── Уведомление ── */}
        <div className={extra("notification", 7)} style={getStyle(7)}>
          <div className="auth-deco__notification">
            <div
              className="auth-deco__dot auth-deco__dot--accent"
              style={{ flexShrink: 0 }}
            />
            <div className="auth-deco__row-bars">
              <div className="auth-deco__bar auth-deco__bar--short" />
              <div
                className="auth-deco__bar auth-deco__bar--xs"
                style={{ width: "70%" }}
              />
            </div>
          </div>
        </div>

        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`auth-deco__particle auth-deco__particle--${i}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AuthDeco;
