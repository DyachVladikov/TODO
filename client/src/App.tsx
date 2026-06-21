import "@/styles/globals.scss";
import { Outlet } from "react-router-dom";
import Content from "@/layouts/Content";
import { TransitionProvider, usePageTransition } from "@/context/TransitionContext";

const AppInner = () => {
  const { isTransitioning } = usePageTransition();
  return (
    <Content>
      <div style={{ opacity: isTransitioning ? 0 : 1, transition: "opacity 0.3s ease" }}>
        <Outlet />
      </div>
    </Content>
  );
};

function App() {
  return (
    <TransitionProvider>
      <AppInner />
    </TransitionProvider>
  );
}

export default App;
