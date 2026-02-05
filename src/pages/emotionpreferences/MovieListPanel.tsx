import { EmotionMovieDetails } from "../../types/movies";
import { EmotionStatusValue } from "./EmotionPreferences";
import MovieListPanelItem from "./MovieListPanelItem";

interface MovieListPanelProps {
  id: string;
  panelTitle: string;
  loading?: boolean;
  selectButtonEnabled?: boolean;
  movies: Map<string, EmotionMovieDetails>;
  emotionMap: Map<string, EmotionStatusValue>;
  activeMovieId: string | null;
  setActiveMovieId: (id: string | null) => void;
  selectedMovieId: string | null;
  setSelectedMovieId: (id: string | null) => void;
}

const MovieListPanel: React.FC<MovieListPanelProps> = ({
  id,
  panelTitle,
  loading = false,
  selectButtonEnabled = false,
  movies,
  emotionMap,
  activeMovieId,
  setActiveMovieId,
  selectedMovieId,
  setSelectedMovieId,
}) => {
  const selectionTags = Array.from(emotionMap.entries()).filter(
    ([emoKey, emoVal]) => emoVal !== "ignore",
  );

  return (
    <div id={id} className="recommendationsListContainer h-full flex flex-col">
      <div className="flex flex-col items-center justify-center bg-gray-200 rounded-t-md p-4 h-[126px] text-center">
        <h5 className="text-lg font-medium mb-2">{panelTitle}</h5>
        {selectionTags.length > 0 ? (
          <div className="badgeContainer flex flex-wrap justify-center gap-1">
            {selectionTags.map(([emo, emoVal], i) => (
              <div
                className="badge flex items-center bg-white rounded-full px-2 py-1 shadow-sm"
                key={"badge_" + i}
              >
                <div className="name text-xs font-medium text-gray-700 mr-2">
                  <span>{emo}</span>
                </div>
                <div
                  className={`status text-xs font-bold uppercase ${emoVal === "low" ? "text-amber-500" : "text-green-600"}`}
                >
                  <span>{emoVal}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-4 text-gray-500">No emotion preference selected</p>
        )}
      </div>
      <div className="relative flex-grow" style={{ minHeight: "504px" }}>
        {loading && (
          <div className="absolute inset-0 bg-black opacity-30 z-50 rounded-b-md flex items-center justify-center">
            <svg
              className="animate-spin h-10 w-10 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        <ul className="list-none p-0 m-0 overflow-y-auto h-full border border-gray-200 rounded-b-md bg-white">
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
    </div>
  );
};

export default MovieListPanel;
