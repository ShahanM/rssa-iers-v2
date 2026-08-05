import type { EmotionMovie } from '../../types/iers.types';

interface MoviePreviewCardProps {
    activeMovie: EmotionMovie | null;
}

const MoviePreviewCard: React.FC<MoviePreviewCardProps> = ({ activeMovie }) => {
    if (!activeMovie) {
        return (
            <div className="w-full flex flex-col items-center">
                <div className="flex">
                    <div className="w-full h-114 content-center">
                        <p>No movie selected</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="w-full flex flex-col items-center">
                <div className="w-full flex justify-center mb-2">
                    <img
                        src={activeMovie.tmdb_poster}
                        alt={'Post of the movie ' + activeMovie.title}
                        className="mx-auto h-72 block img-thumbnail rounded border border-gray-200 p-1"
                    />
                </div>
                <div className="w-full px-1">
                    <h5 className="text-left text-md font-bold">
                        {activeMovie.title} ({activeMovie.year})
                    </h5>
                    <div className="h-34 overflow-y-auto">
                        <p className="text-left">{activeMovie.description}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MoviePreviewCard;
