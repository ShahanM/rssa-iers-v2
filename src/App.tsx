import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { RouteWrapper, WarningDialog } from "@rssa-project/study-template";
import { componentMap } from "./pages/componentMap";
import WelcomePage from "./pages/WelcomePage";
import "./index.css";
import { STRINGS } from "./utils/constants";

function App() {
  const [showWarning, setShowWarning] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setShowWarning(true);
      } else if (window.innerWidth >= 1200) {
        setShowWarning(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="App">
      {showWarning && (
        <WarningDialog
          show={showWarning}
          onClose={setShowWarning}
          title="Warning"
          message={STRINGS.WINDOW_TOO_SMALL}
          disableHide={true}
        />
      )}
      <Router basename="/rssa-iers-v2/">
        <RouteWrapper componentMap={componentMap} WelcomePage={WelcomePage} />
      </Router>
    </div>
  );
}

export default App;
