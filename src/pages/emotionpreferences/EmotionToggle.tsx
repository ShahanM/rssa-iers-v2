import { useRef, useState } from 'react';
import { useStudy } from 'rssa-api';
import { useParticipant } from '../../contexts/ParticipantContext';
import { emotionsDict } from '../../utils/constants';
import { EmotionStatusValue } from './EmotionPreferences';
import clsx from 'clsx';

const initialEmotionMap = new Map<string, EmotionStatusValue>(Object.entries(emotionsDict));


type EmotionPreferenceRequest = {
	user_id: string;
	user_condition: string;
	input_type: 'discrete' | 'continuous';
	emotion_input: Array<{
		emotion: string;
		weight: EmotionStatusValue;
	}>;
	ratings: Array<{
		item_id: string;
		rating: number;
	}>;
}

interface EmotionToggleProps {
	isFinal?: boolean;
	defaultLabel?: string;
	infoCallback?: () => void;
	emotionMap: Map<string, EmotionStatusValue>;
	setEmotionMap: (update: Map<string, EmotionStatusValue> | ((prev: Map<string, EmotionStatusValue>) => Map<string, EmotionStatusValue>)) => void;
	loading?: boolean;
}

const EmotionToggle: React.FC<EmotionToggleProps> = ({
	isFinal,
	defaultLabel = "Ignore",
	emotionMap,
	setEmotionMap,
	loading = false
}) => {

	const [isLocked, setIsLocked] = useState(isFinal || false);
	// const previousEmotionMapPref = useRef<Map<string, EmotionStatusValue> | undefined>(undefined);

	const isDisabled = isLocked || loading;

	const emotionNames: string[] = ['Joy', 'Trust', 'Fear', 'Surprise', 'Sadness', 'Disgust', 'Anger', 'Anticipation'];

	const handleEmotionStateChange = (emotionKey: string, newState: EmotionStatusValue) => {
		setEmotionMap(prevMap => {
			const newMap = new Map(prevMap);
			newMap.set(emotionKey, newState);
			return newMap;
		});
	}

	const handleReset = () => {
		setEmotionMap(initialEmotionMap);
	}

	return (
		<div className="container mx-auto">
			<div className="flex mb-1 mt-7 items-center">
				<h5 className="text-lg font-medium">Adjust your emotion preferences</h5>
				<i className="fas fa-info-circle ml-2 -mt-3 text-gray-500" />
			</div>
			<div className="mb-4">
				<p className="text-left">
					Indicate whether you want the recommended movies to evoke
					less or more of a certain emotion, or to
					{defaultLabel === "Ignore" ?
						<span className="ml-1">
							ignore the emotion in weighing the recommendations.
						</span>
						:
						<span className="ml-1">
							diversify the recommendations along that emotional dimension.
						</span>
					}
				</p>
			</div>
			<div className="emoToggleInputs space-y-1">
				<div className="emoToggleInputsOverlay absolute w-[410px] h-[320px] z-50 hidden"></div>
				{
					emotionNames.map((emotionName, i) => {
						const currentState = emotionMap.get(emotionName) || 'ignore';
						return (
							<div key={`${emotionName}_${i}`} className="flex items-center my-1">
								<div className="w-1/6 h-7 flex items-center">
									<p className="mt-1">{emotionName}</p>
								</div>
								<div className="w-1/3 ml-8 flex">
									<div className="inline-flex rounded-md shadow-sm" role="group">
										<button
											type="button"
											disabled={isDisabled}
											onClick={() => handleEmotionStateChange(emotionName, 'low')}
											className={`px-4 py-1 text-sm font-medium border border-gray-200 rounded-l-lg focus:z-10 focus:ring-2 focus:ring-amber-500 focus:text-amber-700 ${currentState === 'low'
												? 'bg-amber-500 text-white hover:bg-amber-600'
												: 'bg-white text-gray-900 hover:bg-gray-100 hover:text-amber-700'
												} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
										>
											Less
										</button>
										<button
											type="button"
											disabled={isDisabled}
											onClick={() => handleEmotionStateChange(emotionName, 'high')}
											className={clsx(`px-4 py-1 text-sm font-medium border-t border-b border-gray-200 focus:z-10 focus:ring-2 focus:ring-amber-500 focus:text-amber-700, 
												cursor-pointer,
												${currentState === 'high'
													? 'bg-amber-500 text-white hover:bg-amber-600'
													: 'bg-white text-gray-900 hover:bg-gray-100 hover:text-amber-700'
												} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`)}
										>
											More
										</button>
										<button
											type="button"
											disabled={isDisabled}
											onClick={() => handleEmotionStateChange(emotionName, 'ignore')}
											className={`px-4 py-1 text-sm font-medium border border-gray-200 rounded-r-lg focus:z-10 focus:ring-2 focus:ring-amber-500 focus:text-amber-700 ${currentState === 'ignore'
												? 'bg-amber-500 text-white hover:bg-amber-600'
												: 'bg-white text-gray-900 hover:bg-gray-100 hover:text-amber-700'
												} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
										>
											{defaultLabel}
										</button>
									</div>
								</div>
							</div>
						)
					}
					)
				}
			</div>
			<div className="mt-8 flex justify-center">
				<button
					className={`emoToggleResetBtn w-[300px] px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
					onClick={() => handleReset()}
					disabled={isDisabled}
				>
					Reset
				</button>
			</div>
		</div>
	)
}

export default EmotionToggle;