import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./PageTransition.scss";

interface PageTransitionProps {
  to: string;
  onDone: () => void;
}

type Phase = "enter" | "hold" | "leave";

const PageTransition = ({ to, onDone }: PageTransitionProps) => {
  const [phase, setPhase] = useState<Phase>("enter");
  const navigate = useNavigate();

  useEffect(() => {
    const holdTimer  = setTimeout(() => setPhase("hold"),  650);
    const leaveTimer = setTimeout(() => setPhase("leave"),  1000);
    const navTimer   = setTimeout(() => { navigate(to, { replace: true }); onDone(); }, 1650);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(leaveTimer);
      clearTimeout(navTimer);
    };
  }, []);

  return createPortal(
    <div className={`page-transition page-transition--${phase}`}>
      <div className="page-transition__panel page-transition__panel--left" />
      <div className="page-transition__panel page-transition__panel--right" />
      <div className="page-transition__logo">
        <span>TODO</span>
      </div>
    </div>,
    document.body
  );
};

export default PageTransition;
