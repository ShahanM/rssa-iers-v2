import React from 'react';
import type { EmotionMovie } from '../../types/iers.types';
import clsx from 'clsx';

interface MovieListPanelItemProps {
    movie: EmotionMovie;
    selectButtonEnabled?: boolean;
    activeMovieId: string | null;
    setActiveMovieId: (id: string | null) => void;
    selectedMovieId: string | null;
    setSelectedMovieId: (id: string | null) => void;
    pinnedMovieId: string | null;
    setPinnedMovieId: (id: string | null) => void;
}

const MovieListPanelItem: React.FC<MovieListPanelItemProps> = ({
    movie,
    selectButtonEnabled = false,
    activeMovieId,
    setActiveMovieId,
    selectedMovieId,
    setSelectedMovieId,
    pinnedMovieId,
    setPinnedMovieId,
}) => {
    const safeMovieId = String(movie.id);
    const isActive = safeMovieId === String(activeMovieId);
    const isPinned = safeMovieId === String(pinnedMovieId);

    const handleMouseEnter = () => setActiveMovieId(safeMovieId);
    const handleMouseLeave = () => setActiveMovieId(pinnedMovieId);
    const handleClick = () => {
        if (isPinned) {
            setPinnedMovieId(null);
        } else {
            setPinnedMovieId(safeMovieId);
            setActiveMovieId(safeMovieId);
        }
    };

    return (
        <li
            className={clsx(
                'flex justify-between items-center p-1',
                'border-b border-gray-200 transition-colors cursor-pointer',
                isPinned ? 'bg-amber-200' : isActive ? 'bg-amber-100' : 'hover:bg-gray-50'
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <div className={clsx(selectButtonEnabled ? 'w-1/3' : 'w-1/4')}>
                <img className="h-26 object-cover rounded-lg" src={movie.tmdb_poster} alt={movie.title} />
            </div>
            <div className="w-2/3">
                <p className="text-left text-sm font-medium text-gray-700">
                    {movie.title} ({movie.year})
                </p>
            </div>
            {selectButtonEnabled && (
                <div id={'selectButton_' + safeMovieId} className="tour-select-button">
                    {safeMovieId === String(selectedMovieId) ? (
                        <button
                            className={clsx(
                                'p-2 me-2 text-md font-medium rounded-lg bg-green-500 text-white cursor-default'
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            Selected
                        </button>
                    ) : (
                        <button
                            className={clsx(
                                'p-2 me-2 text-md font-medium rounded-lg',
                                'bg-amber-500 text-white hover:bg-amber-600 transition-colors'
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMovieId(safeMovieId);
                            }}
                        >
                            Select
                        </button>
                    )}
                </div>
            )}
        </li>
    );
};

export default MovieListPanelItem;
