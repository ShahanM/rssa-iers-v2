import React, { useEffect, useRef, useState } from 'react';
import { type EmotionMovie } from '../../types/iers.types';
import MovieListPanelItem from './MovieListPanelItem';

interface MovieListPanelProps {
    id: string;
    panelTitle: string;
    loading?: boolean;
    selectButtonEnabled?: boolean;
    movies: EmotionMovie[];
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
    activeMovieId,
    setActiveMovieId,
    selectedMovieId,
    setSelectedMovieId,
}) => {
    const skeletonSlots = Array.from({ length: 7 });
    const [pinnedMovieId, setPinnedMovieId] = useState<string | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setPinnedMovieId(null);
                setActiveMovieId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setActiveMovieId]);

    return (
        <div id={id} ref={panelRef} className="recommendationsListContainer h-full flex flex-col">
            <div className="flex flex-col items-center justify-center bg-gray-200 rounded-t-md p-2 text-center">
                <h5 className="text-lg font-medium">{panelTitle}</h5>
            </div>

            <div className="relative grow" style={{ minHeight: '504px' }}>
                <ul className="list-none p-0 m-0 overflow-y-auto h-full border border-gray-200 rounded-b-md bg-white">
                    {loading || !movies
                        ? skeletonSlots.map((_, index) => (
                              <li
                                  key={`skeleton-${index}`}
                                  className="flex justify-between items-center p-1 border-b border-gray-200 animate-pulse"
                              >
                                  <div>
                                      <div className="h-23 w-16 bg-gray-300 rounded"></div>
                                  </div>

                                  <div className="relative w-[87%] inline-block align-middle ml-2">
                                      <div className="h-4 bg-gray-300 rounded w-2/4 mb-2 mt-1"></div>
                                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                  </div>

                                  {selectButtonEnabled && (
                                      <div className="pr-2">
                                          <div className="h-6 w-16 bg-gray-300 rounded"></div>
                                      </div>
                                  )}
                              </li>
                          ))
                        : movies.map((movie) => {
                              return (
                                  <MovieListPanelItem
                                      key={movie.id}
                                      movie={movie}
                                      selectButtonEnabled={selectButtonEnabled}
                                      activeMovieId={activeMovieId}
                                      setActiveMovieId={setActiveMovieId}
                                      selectedMovieId={selectedMovieId}
                                      setSelectedMovieId={setSelectedMovieId}
                                      pinnedMovieId={pinnedMovieId}
                                      setPinnedMovieId={setPinnedMovieId}
                                  />
                              );
                          })}
                </ul>
            </div>
        </div>
    );
};

export default MovieListPanel;
