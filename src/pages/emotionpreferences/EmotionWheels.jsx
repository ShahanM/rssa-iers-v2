
import WheelOfEmotions from "./WheelOfEmotions";

export default function EmotionWheels({ emotions, movie }) {
	// Normalization function with clamping
	const normalizeData = (value, min, max) => {
		const normalized = (value - min) / (max - min);
		return Math.max(0, Math.min(1, normalized)); // Ensure values stay between 0 and 1
	};

	// Prepare data for the WheelOfEmotions component
	const prepareEmotionData = (emotions, movieEmotions) => {
		return emotions.map(emotion => {
			const rawValue = movieEmotions[emotion.emo.toLowerCase()];
			const normalizedValue = normalizeData(rawValue, emotion.min, emotion.max); // Normalize the value

			return {
				emotion: emotion.emo,
				value: normalizedValue, // Use the normalized value here
				color: getEmotionColor(emotion.emo)
			};
		});
	};

	// Function to assign colors based on the emotion
	const getEmotionColor = (emotion) => {
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
				return 'rgba(200, 200, 200, 0.7)'; // Default grey
		}
	};
	// Apply the normalization to movie.emotions data
	const emotionData = prepareEmotionData(emotions, movie.emotions);

	return (
		<div>
			<div className="flex flex-wrap">
				{/* Render the WheelOfEmotions with normalized data */}
				<WheelOfEmotions data={emotionData} size={200} /> {/* Adjust the size as needed */}
			</div>
		</div>
	);
}