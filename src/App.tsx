import 'bootstrap/dist/css/bootstrap.min.css';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { ThemeProvider, Toast, ToastContainer } from 'react-bootstrap';
import { redirect, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
	Participant,
	StudyStep,
	useStudy
} from 'rssa-api';
import FinalPage from './pages/FinalPage';
import { participantState, studyStepState } from './states/studyState';
import './styles/App.css';
import { RETRY_DELAYS_MS, STRINGS } from './utils/constants';
import { WarningDialog } from './components/dialogs/warningDialog';
import Welcome from './pages/Welcome';


const customBreakpoints = {
	xl: 1200,
	xxl: 1400,
	xxxl: 1800, // Custom breakpoint for viewport size greater than 1800px
	xl4: 2000
};


function App() {

	const { studyApi } = useStudy();
	const [showWarning, setShowWarning] = useState<boolean>(false);
	const [participant, setParticipant] = useRecoilState(participantState);
	const [studyStep, setStudyStep] = useRecoilState(studyStepState);
	const [checkpointUrl, setCheckpointUrl] = useState<string>('/');
	const [studyError, setStudyError] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const [retryAttempt, setRetryAttempt] = useState<number>(0);
	const [showToast, setShowToast] = useState<boolean>(false);

	const handleStepUpdate = useCallback(
		async (step: StudyStep, currentParticipant: Participant, referrer: string) => {
			const newParticipant: Participant = {
				...currentParticipant,
				current_step: step.id,
			};
			try {
				studyApi.put('participants/', newParticipant).then(() => {
					localStorage.setItem('participant', JSON.stringify(newParticipant));
					localStorage.setItem('studyStep', JSON.stringify(step));
					localStorage.setItem('lastUrl', referrer);
				});
				setParticipant(newParticipant);
				setStudyStep(step);
				setCheckpointUrl(referrer);
				studyApi.setParticipantId(newParticipant.id);
			} catch (error) {
				console.error("Error updating participant", error);
				setStudyError(true);
			}
		}, [studyApi, setParticipant, setStudyStep]);

	useEffect(() => {
		if (studyError && !isLoading) {
			const nextDelay = RETRY_DELAYS_MS[retryAttempt];
			if (nextDelay !== undefined) {
				console.log(`Retrying fetch in ${nextDelay / 1000} seconds... (Attempt ${retryAttempt + 1})`);
				setShowToast(true);
				const timerId = setTimeout(() => {
					setRetryAttempt((prev) => prev + 1);
				}, nextDelay);

				return () => {
					clearTimeout(timerId);
					setShowToast(false);
				};
			} else {
				console.warn('Max retry attempts reached. Please refresh to try again.');
				setShowToast(false);
			}
		} else if (!studyError) {
			setRetryAttempt(0);
			setShowToast(false);
		}
	}, [studyError, isLoading, retryAttempt]);


	useEffect(() => {
		let isMounted = true;

		const loadCachedData = () => {
			const participantCache = localStorage.getItem('participant');
			const studyStepCache = localStorage.getItem('studyStep');
			const checkpointUrl = localStorage.getItem('lastUrl');

			if (participantCache && studyStepCache) {
				try {
					const cparticipant = JSON.parse(participantCache);
					const cstudyStep = JSON.parse(studyStepCache);

					if (cparticipant) {
						setParticipant(cparticipant);
						studyApi.setParticipantId(cparticipant.id);
					}
					if (cstudyStep) { setStudyStep(cstudyStep); }
					if (checkpointUrl) { setCheckpointUrl(checkpointUrl); }
					return true;
				} catch (error) {
					console.error("Error parsing cached data", error);

					localStorage.removeItem('participant');
					localStorage.removeItem('studyStep');
					localStorage.removeItem('lastUrl');
					if (isMounted) {
						setStudyError(true);
					}
				}
			}
			return false;
		};

		const fetchInitialData = async () => {
			if (!isMounted) return;

			setIsLoading(true);
			try {
				const fetchedStudyStep = await studyApi.get<StudyStep>('studies/steps/first');
				if (isMounted) {
					setStudyStep(fetchedStudyStep);
					setStudyError(false);
					setRetryAttempt(0);
				}
			} catch (error) {
				console.error("Error fetching initial study data:", error);
				if (isMounted) {
					setStudyError(true);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		if (!participant && !studyStep) {
			if (!loadCachedData()) {
				fetchInitialData();
			} else {
				setIsLoading(false);
			}
		} else {
			setIsLoading(false);
		}

		return () => {
			isMounted = false;
		}
	}, [studyApi, setParticipant, setStudyStep, participant, studyStep, studyError, retryAttempt]);

	useEffect(() => {
		const handleResize = () => { setShowWarning(window.innerWidth < 1200); }
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	if (isLoading) { return <div>Loading...</div> }

	return (
		<ThemeProvider breakpoints={Object.keys(customBreakpoints)}>
			<div className="App">
				{showWarning && <WarningDialog show={showWarning} title="Warning"
					message={STRINGS.WINDOW_TOO_SMALL} disableHide={true} />
				}
				{studyError && (
					<ToastContainer position="top-center" className="p-3">
						<Toast bg="danger" show={showToast} onClose={() => setShowToast(false)} autohide={false}>
							<Toast.Body className="text-white">
								{RETRY_DELAYS_MS[retryAttempt] === undefined ? (
									<>
										{STRINGS.STUDY_ERROR} <br /> Max retry attempts reached. Please refresh to try again.
									</>
								) : (
									<>
										There was an error registering this study. Retrying in{' '}
										{RETRY_DELAYS_MS[retryAttempt] / 1000} seconds...
									</>
								)}
							</Toast.Body>
						</Toast>
					</ToastContainer>
				)}
				<Router basename='/preference-community'>
					<Suspense fallback={<div>Loading...</div>}>
						<Routes>
							<Route path="/" element={
								<Welcome
									next="/demographics"
									checkpointUrl={checkpointUrl}
									setNewParticipant={setParticipant}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							{/* <Route path="/presurvey" element={
								<Survey
									next="/systemintro"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/systemintro" element={
								<SystemIntro
									next="/ratemovies"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/ratemovies" element={
								<MovieRatingPage
									next="/advisors"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/advisors" element={
								<AdvisorsPage
									next="/postsurvey"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/demographics" element={
								<Demographics
									next="/presurvey"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />
							<Route path="/postsurvey" element={
								<Survey
									next="/feedback"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} />

							<Route path="/feedback" element={
								<FeedbackPage
									next="/endstudy"
									checkpointUrl={checkpointUrl}
									onStepUpdate={handleStepUpdate}
									sizeWarning={showWarning}
								/>
							} /> */}

							<Route path="/endstudy" element={
								<FinalPage
									next="/"
									checkpointUrl={checkpointUrl}
									sizeWarning={showWarning}
									onStudyDone={() => { redirect('/'); }}
								/>
							} />
							<Route path="/quit" element={<h1>Thank you for participating!</h1>} />
						</Routes>
					</Suspense>
				</Router>
			</div>
		</ThemeProvider>
	);
}

export default App;