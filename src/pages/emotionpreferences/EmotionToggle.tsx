import clsx from 'clsx';

export type EmotionStatusValue = 'low' | 'high' | 'ignore';

interface EmotionToggleProps {
    isFinal?: boolean;
    defaultLabel?: string;
    emotionMap: Record<string, EmotionStatusValue>;
    setEmotionMap: (map: Record<string, EmotionStatusValue>) => void;
    loading?: boolean;
}

const EmotionToggle: React.FC<EmotionToggleProps> = ({
    isFinal,
    defaultLabel = 'Ignore',
    emotionMap,
    setEmotionMap,
    loading = false,
}) => {
    const isDisabled = isFinal || loading;
    const emotionNames: string[] = ['Joy', 'Trust', 'Fear', 'Surprise', 'Sadness', 'Disgust', 'Anger', 'Anticipation'];

    const handleEmotionStateChange = (emotionKey: string, newState: EmotionStatusValue) => {
        setEmotionMap({
            ...emotionMap,
            [emotionKey]: newState,
        });
    };

    const handleReset = () => {
        const resetMap = Object.fromEntries(Object.entries(emotionMap).map(([key]) => [key, 'ignore'])) as Record<
            string,
            EmotionStatusValue
        >;
        setEmotionMap(resetMap);
    };

    return (
        <div className="container mx-auto">
            <div className="flex mb-1 mt-7 items-center">
                <h5 className="text-md font-bold">Adjust your emotion preferences</h5>
                <i className="fas fa-info-circle ml-2 -mt-3 text-gray-500" />
            </div>
            <div className="my-4">
                <p className="text-left text-md">
                    Indicate whether you want the recommended movies to evoke less or more of a certain emotion, or to
                    {defaultLabel === 'Ignore' ? (
                        <span className="ml-1">ignore the emotion in weighing the recommendations.</span>
                    ) : (
                        <span className="ml-1">diversify the recommendations along that emotional dimension.</span>
                    )}
                </p>
            </div>
            <div className="emoToggleInputs space-y-1">
                <div className="emoToggleInputsOverlay absolute w-102 h-80 z-50 hidden"></div>
                {emotionNames.map((emotionName, i) => {
                    const currentState = emotionMap?.[emotionName] || 'ignore';
                    return (
                        <div key={`${emotionName}_${i}`} className="flex my-3 w-full justify-around">
                            <div className="w-1/3 flex items-center">
                                <p className="text-sm">{emotionName}</p>
                            </div>
                            <div className="">
                                <div className="flex rounded-md shadow-sm" role="group">
                                    <button
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => handleEmotionStateChange(emotionName, 'low')}
                                        className={clsx(
                                            'px-2 py-1 text-sm font-medium border border-gray-200',
                                            'rounded-l-lg focus:z-10 focus:ring-2 focus:ring-amber-500 focus:text-amber-700',
                                            'cursor-pointer',
                                            currentState === 'low'
                                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                                : 'bg-white text-gray-900 hover:bg-gray-100 hover:text-amber-700',
                                            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                        )}
                                    >
                                        Less
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => handleEmotionStateChange(emotionName, 'high')}
                                        className={clsx(
                                            'px-2 py-1 text-sm font-medium border-t border-b border-gray-200',
                                            'focus:z-10 focus:ring-2 focus:ring-amber-500 focus:text-amber-700',
                                            'cursor-pointer',
                                            currentState === 'high'
                                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                                : 'bg-white text-gray-900 hover:bg-gray-100 hover:text-amber-700',
                                            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                        )}
                                    >
                                        More
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => handleEmotionStateChange(emotionName, 'ignore')}
                                        className={clsx(
                                            'px-2 py-1 text-sm font-medium border border-gray-200',
                                            'rounded-r-lg focus:z-10 focus:ring-2 focus:ring-amber-500 focus:text-amber-700',
                                            'cursor-pointer',
                                            currentState === 'ignore'
                                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                                : 'bg-white text-gray-900 hover:bg-gray-100 hover:text-amber-700',
                                            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                        )}
                                    >
                                        {defaultLabel}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-8 flex justify-center">
                <button
                    className={`emoToggleResetBtn w-75 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleReset}
                    disabled={isDisabled}
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default EmotionToggle;
