import React from "react";
import { Movie } from "@rssa-project/study-template";

interface MovieListPanelItemProps {
  movie: Movie;
  selectButtonEnabled?: boolean;
  activeMovieId: string | null;
  setActiveMovieId: (id: string | null) => void;
  selectedMovieId: string | null;
  setSelectedMovieId: (id: string | null) => void;
}

const MovieListPanelItem: React.FC<MovieListPanelItemProps> = ({
  movie,
  selectButtonEnabled = false,
  activeMovieId,
  setActiveMovieId,
  selectedMovieId,
  setSelectedMovieId,
}) => {
  return (
    <div
      className={`flex justify-between items-center p-1 border-b border-gray-200 hover:bg-gray-50 transition-colors ${movie.id === activeMovieId ? "bg-amber-100" : ""}`}
      onMouseEnter={() => setActiveMovieId(movie.id)}
    >
      <div>
        <img
          className="w-[45px] h-[67px] object-cover rounded"
          src={movie.poster}
          alt={movie.title}
        />
      </div>
      <div className="relative w-[87%] inline-block align-middle">
        <p className="mb-0 mt-1 text-left ml-2 text-sm font-medium text-gray-700">
          {movie.title + " (" + movie.year + ")"}
        </p>
      </div>
      {selectButtonEnabled ? (
        <>
          <div id={"selectButton_" + movie.id} className="tour-select-button">
            {movie.id === selectedMovieId ? (
              <button className="px-3 py-1 text-xs font-medium rounded bg-green-500 text-white cursor-default">
                {" "}
                Selected
              </button>
            ) : (
              <button
                className="px-3 py-1 text-xs font-medium rounded bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                onClick={() => setSelectedMovieId(movie.id)}
              >
                Select
              </button>
            )}
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default MovieListPanelItem;
