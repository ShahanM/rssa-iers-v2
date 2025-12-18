import EmotionBars from './EmotionBars';
import EmotionWheels from './EmotionWheels';
import MoviePreviewCard from "./MoviePreviewCard";
import { EmotionMovieDetails } from "../../types/movies";

interface MovieEmotionPreviewPanelProps {
	emoVizEnabled?: boolean;
	vizType?: "wheel" | "bars" | "wheel-straight" | "wheel-inverse" | "wheel-rounded";
	activeMovie: EmotionMovieDetails | null;
}

const MovieEmotionPreviewPanel: React.FC<MovieEmotionPreviewPanelProps> = ({
	emoVizEnabled,
	vizType,
	activeMovie
}) => {

	if (!activeMovie) {
		return (
			<div className="container mx-auto">
				<div className="h-[279px] flex items-center justify-center">
					<h5 className="text-center text-lg font-medium">Select a movie to see its emotional signature</h5>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto">
			<div className="mt-3 h-[279px]">
				<MoviePreviewCard activeMovie={activeMovie} />
			</div>
			<hr className="my-4 border-gray-300" />
			{emoVizEnabled &&
				<>
					<div className="mt-3 text-center">
						<h5 className="text-lg font-medium">Emotional signature</h5>
					</div>
					<div className="mt-3 flex justify-center">
						<EmotionStats movie={activeMovie} vizType={vizType!} />
					</div>
				</>
			}
		</div>
	)
}

const EmotionStats: React.FC<{ movie: EmotionMovieDetails, vizType: "wheel" | "bars" | "wheel-straight" | "wheel-inverse" | "wheel-rounded" }> = ({ movie, vizType }) => {
	const emotions = [
		{ emo: 'Joy', max: 0.318181818181818, min: 0.0382546323968918 },
		{ emo: 'Trust', max: 0.253994490358127, min: 0.0817610062893082 },
		{ emo: 'Fear', max: 0.209126984126984, min: 0.0273270708795901 },
		{ emo: 'Surprise', max: 0.166202984427503, min: 0.0256678889470927 },
		{ emo: 'Sadness', max: 0.188492063492063, min: 0.025706940874036 },
		{ emo: 'Disgust', max: 0.157538659793814, min: 0.00886524822695036 },
		{ emo: 'Anger', max: 0.182929272690844, min: 0.0161596958174905 },
		{ emo: 'Anticipation', max: 0.251623376623377, min: 0.0645546921697549 }
	];

	switch (vizType) {
		case 'bars':
			return (
				<EmotionBars
					emotions={emotions}
					movie={movie}
				/>
			)
		case 'wheel-straight':
			return (
				<EmotionWheels
					emotions={emotions}
					movie={movie}
					variant="straight"
				/>
			)
		case 'wheel-inverse':
			return (
				<EmotionWheels
					emotions={emotions}
					movie={movie}
					variant="inverse"
				/>
			)
		case 'wheel-rounded':
			return (
				<EmotionWheels
					emotions={emotions}
					movie={movie}
					variant="rounded"
				/>
			)
		case 'wheel':
		default:
			return (
				<EmotionWheels
					emotions={emotions}
					movie={movie}
					variant="scaled"
				/>
			)
	}

}

export default MovieEmotionPreviewPanel;