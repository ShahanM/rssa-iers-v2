import React from 'react';
import WheelOfEmotions from "./WheelOfEmotions";
import { EmotionMovieDetails, MovieEmotions } from "../../types/movies";

export interface EmotionConfig {
	emo: string;
	min: number;
	max: number;
}

interface EmotionWheelsProps {
	emotions: EmotionConfig[];
	movie: EmotionMovieDetails;
	variant?: 'straight' | 'inverse' | 'rounded' | 'scaled';
}

interface EmotionData {
	emotion: string;
	value: number;
	color: string;
}

export default function EmotionWheels({ emotions, movie, variant }: EmotionWheelsProps) {
	const normalizeData = (value: number, min: number, max: number): number => {
		const normalized = (value - min) / (max - min);
		return Math.max(0, Math.min(1, normalized));
	};

	const prepareEmotionData = (emotions: EmotionConfig[], movieEmotions: MovieEmotions): EmotionData[] => {
		return emotions.map(emotion => {
			const emotionKey = emotion.emo.toLowerCase() as keyof MovieEmotions;
			const rawValue = movieEmotions[emotionKey];

			let numericValue: number;
			if (typeof rawValue === 'number') {
				numericValue = rawValue;
			} else {
				numericValue = 0;
			}

			const normalizedValue = normalizeData(numericValue, emotion.min, emotion.max);

			return {
				emotion: emotion.emo,
				value: normalizedValue,
				color: getEmotionColor(emotion.emo)
			};
		});
	};

	const getEmotionColor = (emotion: string): string => {
		switch (emotion) {
			case 'Joy':
				return 'rgba(255, 255, 102, 0.7)'; // Adjust alpha to make it more visible
			case 'Trust':
				return 'rgba(102, 204, 102, 0.7)';
			case 'Fear':
				return 'rgba(102, 204, 102, 0.7)';
			case 'Surprise':
				return 'rgba(102, 153, 255, 0.7)';
			case 'Sadness':
				return 'rgba(153, 102, 255, 0.7)';
			case 'Disgust':
				return 'rgba(255, 102, 255, 0.7)';
			case 'Anger':
				return 'rgba(255, 102, 102, 0.7)';
			case 'Anticipation':
				return 'rgba(255, 153, 102, 0.7)';
			default:
				return 'rgba(200, 200, 200, 0.7)';
		}
	};
	const emotionData = prepareEmotionData(emotions, movie.emotions);

	return (
		<div>
			<div className="flex flex-wrap">
				<WheelOfEmotions data={emotionData} size={200} variant={variant} />
			</div>
		</div>
	);
}