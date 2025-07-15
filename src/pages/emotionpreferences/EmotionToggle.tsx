import { useCallback, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Participant, useStudy } from 'rssa-api';
import { MovieRating } from '../../components/moviegrid/moviegriditem/MovieGridItem.types';
import { emotionMovieMapState } from '../../states/emotionmoviestate';
import { emotionState, EmotionStatusValue, initialEmotionMap } from '../../states/emotiontogglestate';
import { ratedMoviesState } from '../../states/ratedmoviestate';
import { participantState } from '../../states/studyState';
import { EmotionMovieDetails } from '../../types/movies';


type EmotionPreferenceRequest = {
	user_id: string;
	user_condition: string;
	input_type: 'discrete' | 'continuous';
	emotion_input: Array<{
		emotion: string;
		weight: EmotionStatusValue;
	}>;
	ratings: Array<{
		item_id: number;
		rating: number;
	}>;
	num_rec: number; // FIXME: This should be handled by the server as a part of the study condition
}

function areMapsDeeplyEqual(map1: Map<string, EmotionStatusValue>, map2: Map<string, EmotionStatusValue>): boolean {
	if (map1.size !== map2.size) {
		return false;
	}
	for (const [key, val] of map1) {
		if (map2.get(key) !== val) {
			return false;
		}
	}
	return true;
}

interface EmotionToggleProps {
	isFinal?: boolean;
	defaultLabel?: string;
	infoCallback?: () => void;
}

const EmotionToggle: React.FC<EmotionToggleProps> = ({
	isFinal,
	defaultLabel = "Ignore",
}) => {

	const { studyApi } = useStudy();

	const [isLocked, setIsLocked] = useState(isFinal || false);
	const previousEmotionMapPref = useRef<Map<string, EmotionStatusValue> | undefined>(undefined);


	const participant: Participant | null = useRecoilValue(participantState);
	const ratedMovies: Map<string, MovieRating> = useRecoilValue(ratedMoviesState);
	const [movies, setMovies] = useRecoilState(emotionMovieMapState);

	const [emotionMap, setEmotionMap] = useRecoilState(emotionState);
	const emotionNames: string[] = ['Joy', 'Trust', 'Fear', 'Surprise', 'Sadness', 'Disgust', 'Anger', 'Anticipation'];

	const handleEmotionStateChange = (emotionKey: string, newState: EmotionStatusValue) => {
		setEmotionMap(prevMap => {
			const newMap = new Map(prevMap);
			newMap.set(emotionKey, newState);
			return newMap;
		});
	}

	const updateRecommendations = useCallback(async () => {
		if (!emotionMap || !participant) {
			console.error("Missing emotionMap or participant");
			return;
		}

		try {
			const response = await studyApi.post<EmotionPreferenceRequest, EmotionMovieDetails[]>(
				'recommendations/ers/update', {
				user_id: participant.id,
				user_condition: participant.condition_id,
				input_type: 'discrete',
				emotion_input: Array.from(emotionMap.entries()).map(([emotion, weight]) => ({
					emotion,
					weight
				})),
				ratings: Array.from(ratedMovies.values()).map((rating) => ({
					item_id: rating.movielens_id,
					rating: rating.rating
				})),
				num_rec: 10 // FIXME: This should be handled by the server as a part of the study condition
			});

			if (response && response.length > 0) {
				setMovies(new Map(response.map(item => [item.id, item])));
			}
		} catch (error) {
			console.error("Error updating recommendations:", error);
		}

		console.log("Updating recommendations with emotion map:", emotionMap);
	}, [emotionMap, participant, ratedMovies, studyApi, setMovies]);

	useEffect(() => {
		if (previousEmotionMapPref.current === undefined) {
			previousEmotionMapPref.current = emotionMap;
			console.log("Initial emotion map, skipping API call.", emotionMap);
			return;
		}

		if (!areMapsDeeplyEqual(emotionMap, previousEmotionMapPref.current)) {
			console.log("Emotion map changed, updating recommendations.", emotionMap);
			updateRecommendations();
		} else {
			console.log("Emotion map did not change, skipping API call.", emotionMap);
		}

		previousEmotionMapPref.current = emotionMap;
	}, [updateRecommendations, emotionMap]);

	const handleReset = () => {
		setEmotionMap(initialEmotionMap);
	}

	return (
		<Container>
			<Row>
				<div style={{ marginBottom: "3px", display: "inline-flex", marginTop: "27px" }}>
					<h5>Adjust your emotion preferences</h5>
					<i className="fas fa-info-circle"
						style={{ marginTop: "-13px", marginLeft: "9px" }}
					/>
				</div>
			</Row>
			<Row>
				<p style={{ textAlign: "left" }}>
					Indicate whether you want the recommended movies to evoke
					less or more of a certain emotion, or to
					{defaultLabel === "Ignore" ?
						<span style={{ marginLeft: "0.5ex" }}>
							ignore the emotion in weighing the recommendations.
						</span>
						:
						<span style={{ marginLeft: "0.5ex" }}>
							diversify the recommendations along that emotional dimension.
						</span>
					}
				</p>
			</Row>
			<Row className="emoToggleInputs">
				<div className="emoToggleInputsOverlay" style={{ position: "absolute", width: "410px", height: "320px", zIndex: "999", display: "None" }}></div>
				{
					emotionNames.map((emotionName, i) => {
						const currentState = emotionMap.get(emotionName) || 'ignore';
						return (
							<Row key={`${emotionName}_${i}`} md={2} style={{ margin: "3px 0" }}>
								<Col className="d-flex" md={{ span: 2 }} style={{ height: "27px" }}>
									<p style={{ marginTop: "3px" }}>{emotionName}</p>
								</Col>
								<Col md={{ span: 3, offset: 1 }}>
									<ToggleButtonGroup type="radio" name={emotionName + "_Toggle"} value={currentState}
										onChange={(evt) => handleEmotionStateChange(emotionName, evt)}>
										<ToggleButton id={emotionName + "_low"} value={"low"} disabled={isLocked}
											className={currentState === 'low' ? 'ersToggleBtnChecked' : 'ersToggleBtn'}>
											Less
										</ToggleButton>
										<ToggleButton id={emotionName + "_high"} value={"high"} disabled={isLocked}
											className={currentState === 'high' ? 'ersToggleBtnChecked' : 'ersToggleBtn'}>
											More
										</ToggleButton>
										<ToggleButton id={emotionName + "_ignore"} value={"ignore"} disabled={isLocked}
											className={currentState === 'ignore' ? 'ersToggleBtnChecked' : 'ersToggleBtn'}>
											{defaultLabel}
										</ToggleButton>
									</ToggleButtonGroup>
								</Col>
							</Row>
						)
					}
					)
				}
			</Row>
			<Row style={{ marginTop: "2em" }}>
				<Button className="emoToggleResetBtn" style={{ margin: "auto", width: "300px" }} variant="ersCancel" onClick={() => handleReset()} disabled={isLocked}>
					Reset
				</Button>
			</Row>
		</Container>
	)
}

export default EmotionToggle;