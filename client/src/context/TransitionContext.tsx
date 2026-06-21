import { createContext, useContext, useState } from "react";
import PageTransition from "@/components/PageTransition";

interface TransitionContextValue {
  startTransition: (to: string) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextValue>({ startTransition: () => {}, isTransitioning: false });

export const usePageTransition = () => useContext(TransitionContext);

export const TransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const [target, setTarget] = useState<string | null>(null);

  return (
    <TransitionContext.Provider value={{ startTransition: setTarget, isTransitioning: !!target }}>
      {children}
      {target && <PageTransition to={target} onDone={() => setTarget(null)} />}
    </TransitionContext.Provider>
  );
};
