import { useCallback, useEffect, useState } from "react";
import { Col, Container, FormGroup, FormLabel, FormSelect, Row, Spinner } from "react-bootstrap";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { CurrentStep, Participant, StudyStep, useStudy } from "rssa-api";
import { WarningDialog } from "../../components/dialogs/warningDialog";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { MovieRating } from "../../components/moviegrid/moviegriditem/MovieGridItem.types";
import { emotionMovieMapState } from "../../states/emotionmoviestate";
import { ratedMoviesState } from "../../states/ratedmoviestate";
import { participantState, studyStepState } from "../../states/studyState";
import { EmotionMovieDetails } from "../../types/movies";
import { studyConditions } from "../../utils/constants";
import { StudyPageProps } from "../StudyPage.types";
import EmotionToggle from "./EmotionToggle";
import MovieEmotionPreviewPanel from "./MovieEmotionPreviewPanel";
import MovieListPanel from "./MovieListPanel";



interface LocationState {
	ratedMovies?: { [key: number]: MovieRating };
}

type ApiMovieRating = {
	item_id: number;
	rating: number;
}
type PreferenceRequestObject = {
	user_id: string;
	user_condition: string;
	is_baseline: boolean;
	ratings: ApiMovieRating[];
}

const EmotionPreferences: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	onStepUpdate,
	sizeWarning
}) => {
	const participant: Participant | null = useRecoilValue(participantState);
	const studyStep: StudyStep | null = useRecoilValue(studyStepState);
	const ratedMovies: Map<string, MovieRating> = useRecoilValue(ratedMoviesState);
	const [movies, setMovies] = useRecoilState(emotionMovieMapState);

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	const [recCriteria, setRecCriteria] = useState('')
	const [loading, setLoading] = useState<boolean>(false);
	const [nextButtonDisabled, setNextButtonDisabled] = useState<boolean>(true);
	const [emoVizType, setEmoVizType] = useState<"wheel" | "bars">("wheel");

	// FIXME:
	// Temporary state to get condition from URL for development testing
	// NOTE: Condition 5 is Baseline in the test study, so we will get TopN
	const [searchParams, setSearchParams] = useSearchParams();

	const condition = 5;
	const emoVizEnabled = studyConditions[condition].emoVizEnabled;
	const emoTogglesEnabled = studyConditions[condition].emoTogglesEnabled;
	const defaultEmoWeightLabel = studyConditions[condition].defaultEmoWeightLabel;

	const [isToggleDone, setIsToggleDone] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const [selectButtonEnabled, setSelectButtonEnabled] = useState(false);

	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	const getRecommendations = useCallback(async () => {
		if (!participant || !studyStep || ratedMovies.size === 0) {
			console.error("Participant or study step is not defined.");
			return;
		}
		setLoading(true);
		try {
			console.log("Fetching recommendations with rated movies:", ratedMovies);
			const ratingsReqObj = [...ratedMovies.values()].map(rating => {
				return { item_id: rating.movielens_id, rating: rating.rating };
			});
			console.log("Ratings request object:", ratingsReqObj);
			const responseItems: any = await studyApi.post<PreferenceRequestObject, EmotionMovieDetails[]>(
				"recommendations/ers", {
				user_id: participant.id,
				user_condition: participant.condition_id,
				is_baseline: parseInt(searchParams.get('cond') || '1') === 5,
				ratings: [...ratedMovies.values()].map(rating => {
					return { item_id: rating.movielens_id, rating: rating.rating };
				})
			});
			let itemMap = new Map<string, EmotionMovieDetails>();
			for (let item of responseItems) { itemMap.set(item.id, item); }
			setMovies(itemMap);
		} catch (err: any) {
			console.error("Error fetching recommendations", err);
		} finally {
			setLoading(false);
		}
	}, [studyApi, searchParams, participant, studyStep, setMovies, ratedMovies]);

	useEffect(() => { getRecommendations(); }, [getRecommendations]);

	const handleNextBtn = async () => {
		if (!participant || !studyStep) {
			console.error("Participant or study step is not defined.");
			return;
		}
		if (!isToggleDone) {
			setShowWarning(true);
			return;
		}
		try {
			const nextStep: StudyStep = await studyApi.post<CurrentStep, StudyStep>('studies/steps/next', {
				current_step_id: participant.current_step
			});
			onStepUpdate(nextStep, participant, next);
			navigate(next);
		} catch (error) {
			console.error("Error getting next to updating study progress", error);
		}
	}

	const confirmWarning = () => {
		setShowWarning(false);
		setIsToggleDone(true);
	}

	const cancelWarning = () => {
		setShowWarning(false);
	}

	useEffect(() => {
		if (isToggleDone) {
			setSelectButtonEnabled(true);
		}
	}, [isToggleDone]);

	if (!movies || movies.size === 0) {
		return (
			<h1>Loading</h1>
		);
	}


	return (
		<Container>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			<Row className="mb-3">
				<FormGroup className="d-flex align-items-center">
					<FormLabel className="w-25">
						Select Viz Type
					</FormLabel>
					<FormSelect className="w-25"
						value={emoVizType}
						onChange={(e) => {
							setEmoVizType(e.target.value as "wheel" | "bars");
						}}>
						<option value="bars">Emotion bars</option>
						<option value="wheel">Plutchik Wheel of Emotions</option>
					</FormSelect>
				</FormGroup>
			</Row>
			<WarningDialog show={showWarning} title={"Are you sure?"}
				message={`<p>Finalizing will freeze your current emotion settings.</p> 
								<p>This action cannot be undone.</p>`}
				confirmCallback={confirmWarning}
				confirmText={"Confirm"}
				cancelCallback={cancelWarning} />
			<Row style={{ height: "fit-content" }}>
				<Col id="emotionPanel">
					<div className="emoPrefControlPanel">
						{emoTogglesEnabled &&
							<Row>
								<EmotionToggle
									isFinal={isToggleDone}
									defaultLabel={defaultEmoWeightLabel} />
							</Row>
						}
					</div>
				</Col>
				<Col id="moviePanel">
					{loading ?
						<div className="movieListPanelOverlay" style={{
							position: "absolute", width: "415px", marginTop: "99px",
							height: "504px", borderRadius: "5px",
							zIndex: "999", display: "block", backgroundColor: "rgba(72, 72, 72, 0.8)"
						}}>
							<Spinner animation="border" role="status" style={{ margin: "300px auto", color: "white" }}>
								<span className="sr-only">Loading...</span>
							</Spinner>
						</div>
						: ""}
					<MovieListPanel id="leftPanel" panelTitle={'Recommendations'} selectButtonEnabled={selectButtonEnabled} />
				</Col>
				<Col id="moviePosterPreview">
					<div className="d-flex mx-auto moviePreviewPanel">
						<MovieEmotionPreviewPanel emoVizEnabled={emoVizEnabled} vizType={emoVizType} />
					</div>
				</Col>
			</Row>
			<Row>
				<Footer callback={handleNextBtn} text={`${isToggleDone ? "Next" : "Finalize"}`} />
			</Row>
		</Container>
	);
};

export default EmotionPreferences;