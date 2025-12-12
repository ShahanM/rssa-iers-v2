import { EmotionMovieDetails } from "../../types/movies";
import { EmotionStatusValue } from "./EmotionPreferences";
import MovieListPanelItem from "./MovieListPanelItem";

interface MovieListPanelProps {
	id: string;
	panelTitle: string;
	selectButtonEnabled?: boolean;
	movies: Map<string, EmotionMovieDetails>;
	emotionMap: Map<string, EmotionStatusValue>;
	activeMovieId: string | null;
	setActiveMovieId: (id: string | null) => void;
	selectedMovieId: string | null;
	setSelectedMovieId: (id: string | null) => void;
}


const MovieListPanel: React.FC<MovieListPanelProps> = ({
	id, panelTitle, selectButtonEnabled = false,
	movies, emotionMap,
	activeMovieId, setActiveMovieId, selectedMovieId, setSelectedMovieId
}) => {

	const selectionTags = Array.from(emotionMap.entries()).filter(([emoKey, emoVal]) => emoVal !== 'ignore');

	console.log("Selection Tags:", selectionTags, emotionMap);

	return (
		<div id={id} className="recommendationsListContainer h-full flex flex-col">
			<div className="flex flex-col items-center justify-center bg-gray-200 rounded-t-md p-4 h-[99px] text-center">
				<h5 className="text-lg font-medium mb-2">{panelTitle}</h5>
				{
					selectionTags.length > 0 ?
						<div className="badgeContainer flex flex-wrap justify-center gap-2">
							{selectionTags.map(([emo, emoVal], i) => (
								<div className="badge flex items-center bg-white rounded-full px-3 py-1 shadow-sm" key={'badge_' + i}>
									<div className="name font-medium text-gray-700 mr-2">
										<span>{emo}</span>
									</div>
									<div className={`status text-xs font-bold uppercase ${emoVal === 'low' ? "text-amber-500" : "text-green-600"}`}>
										<span>{emoVal}</span>
									</div>
								</div>
							))}
						</div>
						:
						<p className="p-4 text-gray-500">No emotion preference selected</p>
				}
			</div>
			<ul className="list-none p-0 m-0 overflow-y-auto flex-grow border border-gray-200 rounded-b-md bg-white" style={{ minHeight: "504px" }}>
				{[...movies.values()].map((movie) => (
					<MovieListPanelItem
						key={movie.id}
						movie={movie}
						selectButtonEnabled={selectButtonEnabled}
						activeMovieId={activeMovieId}
						setActiveMovieId={setActiveMovieId}
						selectedMovieId={selectedMovieId}
						setSelectedMovieId={setSelectedMovieId}
					/>
				))}
			</ul>
		</div>
	)
}

export default MovieListPanel;