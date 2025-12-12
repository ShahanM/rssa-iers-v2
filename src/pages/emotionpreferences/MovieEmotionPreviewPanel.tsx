import EmotionStats from "./emotionStats";
import MoviePreviewCard from "./MoviePreviewCard";
import { EmotionMovieDetails } from "../../types/movies";

interface MovieEmotionPreviewPanelProps {
	emoVizEnabled?: boolean;
	vizType?: "wheel" | "bars";
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
						<EmotionStats movie={activeMovie} vizType={vizType} />
					</div>
				</>
			}
		</div>
	)
}

export default MovieEmotionPreviewPanel;