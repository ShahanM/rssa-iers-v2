import { useMemo, useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStudy } from "rssa-api";
import { StudyLayoutContextType } from "rssa-study-template";
import { useOutletContext } from "react-router-dom";
import { WarningDialog } from "../../components/dialogs/warningDialog";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import { EmotionMovieDetails } from "../../types/movies";
import { studyConditions, emotionsDict } from "../../utils/constants";
import EmotionToggle from "./EmotionToggle";
import MovieEmotionPreviewPanel from "./MovieEmotionPreviewPanel";
import MovieListPanel from "./MovieListPanel";
import { useNextButtonControl, useStepCompletion } from "rssa-study-template";

export type EmotionStatusValue = string;

type EmotionsPayload = {
	step_id: string;
	context_tag: string;
	emotion_input?: {
		emotion: string;
		weight: string;
	}[];
};

const initialEmotionMap = new Map<string, EmotionStatusValue>(Object.entries(emotionsDict));

const EmotionPreferencesContent: React.FC = () => {
	const { studyStep, resetNextButton } = useOutletContext<StudyLayoutContextType>();
	const { setIsStepComplete } = useStepCompletion();
	const { studyApi } = useStudy();

	const [emotionMap, setEmotionMap] = useState<Map<string, EmotionStatusValue>>(initialEmotionMap);
	const [activeMovieId, setActiveMovieId] = useState<string | null>(null);
	const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

	const [emoVizType, setEmoVizType] = useState<"wheel" | "bars" | "wheel-straight" | "wheel-inverse" | "wheel-rounded">("wheel");
	const [isToggleDone, setIsToggleDone] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const [selectButtonEnabled, setSelectButtonEnabled] = useState(false);

	const condition = 5;
	const context_tag = `ers-${condition}`;
	const emoVizEnabled = studyConditions[condition].emoVizEnabled;
	const emoTogglesEnabled = studyConditions[condition].emoTogglesEnabled;
	const defaultEmoWeightLabel = studyConditions[condition].defaultEmoWeightLabel;

	const contextData = useMemo(() => {
		const payload: EmotionsPayload = { step_id: studyStep?.id, context_tag: context_tag };
		const isAllIgnored = Array.from(emotionMap.values()).every((val) => val === "ignore");
		if (isAllIgnored) {
			payload.context_tag = `${context_tag}-all-ignore`;
			return payload;
		}

		let contextString = "";
		const emotionInput = Array.from(emotionMap.entries()).map(([emotion, weight]) => {
			if (weight !== "ignore") {
				contextString += `${emotion}-${weight},`;
			}
			return {
				emotion: emotion.toLowerCase(),
				weight,
			};
		});
		contextString = contextString.slice(0, -1);
		payload.context_tag = `${context_tag}-${contextString}`;
		payload.emotion_input = emotionInput;
		return payload;
	}, [emotionMap, studyStep]);

	useEffect(() => {
	}, [studyStep, contextData]);

	const {
		data: moviesList = [],
		isLoading,
		isFetching,
		error,
	} = useQuery<EmotionMovieDetails[]>({
		queryKey: ["recommendations", contextData],
		queryFn: async () => {
			try {
				const response = await studyApi.post<any, EmotionMovieDetails[]>("recommendations/", contextData);
				return response;
			} catch (err) {
				console.error("Query failed:", err);
				throw err;
			}
		},
		enabled: !!studyStep,
		staleTime: 0,
		refetchOnWindowFocus: false,
	});

	const loading = isLoading || isFetching;

	useEffect(() => {
		if (error) console.error("Query Error State:", error);
	}, [error]);

	const handleFinalize = useCallback(() => {
		setShowWarning(true);
	}, []);

	const { setButtonControl } = useNextButtonControl();

	useEffect(() => {
		if (loading) return;

		if (!isToggleDone) {
			setButtonControl({
				label: "Finalize",
				action: handleFinalize,
				isDisabled: false,
			});
		} else {
			resetNextButton();

			// Selection Phase Tour
			const driverObj = driver({
				showProgress: true,
				steps: [
					{
						element: '.tour-select-button',
						popover: {
							title: 'Select a Movie',
							description: 'Now that you have finalized your preferences, please select one movie from the list that best matches your mood.',
							side: "left",
							align: 'start'
						}
					}
				]
			});
			driverObj.drive();
		}
		return () => {
			resetNextButton();
		};
	}, [loading, isToggleDone, setButtonControl, handleFinalize, resetNextButton]);

	// Intro Tour
	useEffect(() => {
		const driverObj = driver({
			showProgress: true,
			steps: [
				{
					element: '#emotionPanel',
					popover: {
						title: 'Adjust Your Preferences',
						description: 'Use these toggles to tell us how you are feeling right now. You can ignore emotions that do not apply.',
						side: "right",
						align: 'start'
					}
				},
				{
					element: '#moviePanel',
					popover: {
						title: 'Explore Recommendations',
						description: 'As you adjust your feelings, this list will update with movie recommendations tailored to your mood.',
						side: "left",
						align: 'start'
					}
				},
				{
					element: '#moviePosterPreview',
					popover: {
						title: 'Preview',
						description: 'Hover over a movie in the list to see its details and how it matches your emotion profile here.',
						side: "left",
						align: 'start'
					}
				}
			]
		});

		driverObj.drive();
	}, []);

	const movies = useMemo(() => {
		const map = new Map<string, EmotionMovieDetails>();
		moviesList.forEach((m) => map.set(m.id, m));
		return map;
	}, [moviesList]);

	const activeMovie = useMemo(() => {
		if (activeMovieId && movies.has(activeMovieId)) {
			return movies.get(activeMovieId) || null;
		}
		return null;
	}, [activeMovieId, movies]);

	const confirmWarning = () => {
		setShowWarning(false);
		setIsToggleDone(true);
		setSelectButtonEnabled(true);
		setIsStepComplete(true);
	};

	const cancelWarning = () => {
		setShowWarning(false);
	};

	return (
		<div className="container mx-auto px-4">
			<div className="mb-6">
				<div className="flex items-center">
					<label className="w-1/4 font-medium text-gray-700">Select Viz Type</label>
					<select
						className="w-1/4 mt-1 block rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
						value={emoVizType}
						onChange={(e) => {
							setEmoVizType(e.target.value as "wheel" | "bars" | "wheel-straight" | "wheel-inverse" | "wheel-rounded");
						}}
					>
						<option value="wheel">Plutchik Wheel of Emotions</option>
						<option value="wheel-straight">Plutchik Wheel - Straight</option>
						<option value="wheel-inverse">Plutchik Wheel - Inverse</option>
						<option value="wheel-rounded">Plutchik Wheel - Rounded</option>
						<option value="bars">Emotion bars</option>
					</select>
				</div>
			</div>

			<WarningDialog
				show={showWarning}
				title={"Are you sure?"}
				message={`<p>Finalizing will freeze your current emotion settings.</p> 
								<p>This action cannot be undone.</p>`}
				confirmCallback={confirmWarning}
				confirmText={"Confirm"}
				cancelCallback={cancelWarning}
			/>

			<div className="flex flex-wrap -mx-4" style={{ height: "fit-content" }}>
				{/* Left Panel: Toggles */}
				<div id="emotionPanel" className="w-full lg:w-4/12 px-4">
					<div className="emoPrefControlPanel">
						{emoTogglesEnabled && (
							<div>
								<EmotionToggle
									isFinal={isToggleDone}
									defaultLabel={defaultEmoWeightLabel}
									emotionMap={emotionMap}
									setEmotionMap={setEmotionMap}
									loading={loading}
								/>
							</div>
						)}
					</div>
				</div>

				{/* Middle Panel: Recommendations */}
				<div id="moviePanel" className="w-full lg:w-4/12 px-4 relative">
					<MovieListPanel
						id="leftPanel"
						panelTitle={"Recommendations"}
						loading={loading}
						selectButtonEnabled={selectButtonEnabled}
						movies={movies}
						emotionMap={emotionMap}
						activeMovieId={activeMovieId}
						setActiveMovieId={setActiveMovieId}
						selectedMovieId={selectedMovieId}
						setSelectedMovieId={setSelectedMovieId}
					/>
				</div>

				{/* Right Panel: Preview */}
				<div id="moviePosterPreview" className="w-full lg:w-4/12 px-4">
					<div className="flex mx-auto moviePreviewPanel justify-center">
						<MovieEmotionPreviewPanel
							emoVizEnabled={emoVizEnabled}
							vizType={emoVizType}
							activeMovie={activeMovie}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EmotionPreferencesContent;
