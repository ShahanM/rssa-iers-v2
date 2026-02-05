import { EmotionMovieDetails } from "../../types/movies";

interface MoviePreviewCardProps {
	activeMovie: EmotionMovieDetails | null;
}


const MoviePreviewCard: React.FC<MoviePreviewCardProps> = ({ activeMovie }) => {

	if (!activeMovie) {
		return (
			<div className="moviePreviewCard container mx-auto">
				<div className="flex">
					<div className="w-full">
						<p>No movie selected</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="moviePreviewCard container mx-auto">
			<div className="flex">
				<div className="w-1/2 px-2">
					<div className="movie-preview-card-image">
						<img src={activeMovie.tmdb_poster}
							alt={"Post of the movie " + activeMovie.title}
							className="mx-auto block img-thumbnail rounded border border-gray-200 p-1" />
					</div>
				</div>
				<div className="w-1/2 px-2">
					<div className="mb-2">
						<h5 className="text-left text-lg font-medium">{activeMovie.title} ({activeMovie.year})</h5>
					</div>
					<div className="h-[216px] overflow-y-auto">
						<p className="text-left">
							{activeMovie.description}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MoviePreviewCard;