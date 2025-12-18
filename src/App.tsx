import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { RouteWrapper, SurveyPage, MovieRatingPage, DemographicsPage, FinalPage, FeedbackPage } from "rssa-study-template";
import { WarningDialog } from "./components/dialogs/warningDialog";
import WelcomePage from "./pages/WelcomePage";
import EmotionPreferences from "./pages/emotionpreferences/EmotionPreferences";
import "./index.css";
import "./styles/App.css";
import { STRINGS } from "./utils/constants";
import ConsentPage from "./pages/ConsentPage";
import StudyOverviewPage from "./pages/StudyOverviewPage";

const customBreakpoints = {
	xl: 1200,
	xxl: 1400,
	xxxl: 1800,
	xl4: 2000,
};

const componentMap = {
	SurveyStep: SurveyPage,
	StudyOverviewStep: StudyOverviewPage,
	PreferenceElicitationStep: MovieRatingPage,
	ExtraStep: FeedbackPage,
	DemographicsStep: DemographicsPage,
	CompletionStep: FinalPage,
	ConsentStep: ConsentPage,
	TaskStep: EmotionPreferences,
};

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
