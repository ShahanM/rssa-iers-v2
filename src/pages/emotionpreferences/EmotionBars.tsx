import React from 'react';
import { EmotionMovieDetails, MovieEmotions } from "../../types/movies";
import { EmotionConfig } from "./EmotionWheels"; // Import exported interface from EmotionWheels

interface EmotionBarsProps {
	emotions: EmotionConfig[];
	movie: EmotionMovieDetails;
}

export default function EmotionBars({ emotions, movie }: EmotionBarsProps) {

	const getEmoScaled = (emo: EmotionConfig, movieEmotions: MovieEmotions): number => {
		const emotionKey = emo.emo.toLowerCase() as keyof MovieEmotions;
		const emoVal = movieEmotions[emotionKey] as number;
		return (emoVal - emo.min) / (emo.max - emo.min);
	}

	const hslToRgb = (h: number, s: number, l: number): number[] => {
		let r, g, b;

		if (s === 0) {
			r = g = b = l; // achromatic
		} else {
			const hue2rgb = function hue2rgb(p: number, q: number, t: number) {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			}

			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}


	const numberToColorHsl = (emoVal: number, emoMin: number, emoMax: number): string => {
		let ratio = emoVal;
		if (emoMin > 0 || emoMax < 1) {
			if (emoVal < emoMin) {
				ratio = 0;
			} else if (emoVal > emoMax) {
				ratio = 1;
			} else {
				var range = emoMax - emoMin;
				ratio = (emoVal - emoMin) / range;
			}
		}

		const hue = ratio * 1.2 / 3.60;

		const rgb = hslToRgb(hue, 1, .5);
		return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
	}

	const linearGradient = (emo: EmotionConfig, movieEmotions: MovieEmotions): string => {
		const emotionKey = emo.emo.toLowerCase() as keyof MovieEmotions;
		const emoVal = movieEmotions[emotionKey] as number;
		const gradStart = numberToColorHsl(emo.min, emo.min, emo.max);
		const gradEnd = numberToColorHsl(emoVal, emo.min, emo.max);

		return 'linear-gradient(90deg, ' + gradStart + ', ' + gradEnd + ')';
	}

	return (
		<div className="emoStatbars">
			{
				emotions.map((emotion, i) =>
					<div
						key={emotion.emo + '_' + i + '_' + movie.id}
						className="flex items-center mb-1 h-7"
					>
						<div className="w-1/4 text-right pr-2">
							<span style={{ whiteSpace: "nowrap" }}>{emotion.emo}</span>
						</div>

						<div className="w-3/4 pl-2">
							<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
								<div
									className="h-full rounded-full transition-all duration-500"
									style={{
										width: `${getEmoScaled(emotion, movie.emotions) * 100}%`,
										background: linearGradient(emotion, movie.emotions)
									}}
								/>
							</div>
						</div>
					</div>
				)
			}
		</div>
	)
}