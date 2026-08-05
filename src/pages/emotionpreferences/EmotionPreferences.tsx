import { useFetchParticipant, useStudy } from '@rssa-project/api';
import {
    LoadingScreen,
    type StudyLayoutContextType,
    useNextButtonControl,
    useStepCompletion,
    WarningDialog,
} from '@rssa-project/study-template';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import useRecommendationsFetch from '../../hooks/useRecommendationsFetch';
import {
    type EmotionMovie,
    type InteractionPayload,
    type InteractionResponse,
    type SelectionEntry,
} from '../../types/iers.types';
import { emotionsDict } from '../../utils/constants';
import { conditionMap, emotionsConfig } from './conditionMap';
import EmotionToggle, { type EmotionStatusValue } from './EmotionToggle';
import MovieListPanel from './MovieListPanel';
import MoviePreviewCard from './MoviePreviewCard';

const initialEmotionMap: Record<string, EmotionStatusValue> = Object.keys(emotionsDict).reduce(
    (acc, key) => {
        acc[key] = 'ignore';
        return acc;
    },
    {} as Record<string, EmotionStatusValue>
);

const EmotionPreferences: React.FC = () => {
    const { studyApi } = useStudy();
    const queryClient = useQueryClient();

    const { studyStep, resetNextButton } = useOutletContext<StudyLayoutContextType>();

    const { setIsStepComplete } = useStepCompletion();
    const { setButtonControl } = useNextButtonControl();
    const { data: participant } = useFetchParticipant();

    const [emotionMap, setEmotionMap] = useState<Record<string, EmotionStatusValue>>(initialEmotionMap);
    const [activeMovieId, setActiveMovieId] = useState<string | null>(null);
    const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

    const [isToggleDone, setIsToggleDone] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [hasSeenTour, setHasSeenTour] = useState(false);

    const externalCode = participant?.study_condition?.short_code;
    const viewLinkKey = participant?.study_condition?.view_link_key;
    // const viewLinkKey = 'WHEEL_TOGGLE';
    // const viewLinkKey = 'DOTPLOT_TOGGLE';
    // const viewLinkKey = 'LOLLIPOP_TOGGLE';
    // const viewLinkKey = 'NO_VIZ_TOGGLE';
    // const viewLinkKey = 'COMBINED_WHEEL_TOGGLE';
    const conditionIdentifier = viewLinkKey && conditionMap[viewLinkKey] ? viewLinkKey : externalCode;
    const conditionConfig = conditionIdentifier ? conditionMap[conditionIdentifier] : undefined;

    const ConditionalVisualizer = conditionConfig?.Visualizer;
    const controlState = conditionConfig?.controlState || 'toggle';
    const defaultEmoWeightLabel = conditionConfig?.defaultEmoWeightLabel || 'Ignore';
    const emoTogglesEnabled = controlState !== 'hidden';

    const contextData = useMemo(() => {
        const emotionInput: Array<{ emotion: string; weight: string }> = [];
        let tagSuffix = '';

        Object.entries(emotionMap).forEach(([emotion, weight]) => {
            if (weight !== 'ignore') {
                emotionInput.push({ emotion: emotion.toLowerCase(), weight });
                tagSuffix += `${emotion.toLowerCase()}-${weight}_`;
            }
        });

        const finalTag = tagSuffix ? `emotion_tuning_${tagSuffix.slice(0, -1)}` : 'emotion_tuning_baseline';

        return {
            schema_type: 'standard_emotion',
            context_tag: finalTag,
            emotion_input: emotionInput,
        };
    }, [emotionMap]);

    const { data: recommendationsArray, isLoading: isLoadingRecommendations } = useRecommendationsFetch(
        studyStep.id,
        contextData
    );

    const movieLookupMap = useMemo(() => {
        const map = new Map<string, EmotionMovie>();
        if (recommendationsArray) {
            recommendationsArray.forEach((m) => map.set(String(m.id), m));
        }
        return map;
    }, [recommendationsArray]);

    const activeMovie = activeMovieId ? movieLookupMap.get(activeMovieId) || null : null;

    const { data: interactions } = useQuery<InteractionResponse[]>({
        queryKey: ['interactions', studyStep?.id],
        queryFn: async () => {
            const res = await studyApi.get<InteractionResponse[]>(`responses/interactions/${studyStep?.id}`);
            return res || [];
        },
        enabled: !!studyStep?.id,
    });

    const interactionMutation = useMutation<InteractionResponse, Error, string>({
        mutationFn: async (selectedId: string) => {
            const timestamp = new Date().toISOString();
            const selectionEntry: SelectionEntry = { timestamp, movie_id: selectedId };
            const targetTag = contextData.context_tag;

            const existing = (interactions as Array<InteractionResponse & { context_tag?: string }>)?.find(
                (i) => i.context_tag === targetTag
            );

            if (existing) {
                const currentSelection = existing.payload_json.selection || [];

                const newPayload: InteractionPayload = {
                    ...existing.payload_json,
                    selection: [...currentSelection, selectionEntry],
                };
                const currentVersion = existing.version ?? 0;
                await studyApi.patch(`responses/interactions/${existing.id}`, {
                    id: existing.id,
                    version: existing.version,
                    payload_json: newPayload,
                });

                return {
                    ...existing,
                    version: currentVersion + 1,
                    payload_json: newPayload,
                };
            } else {
                return await studyApi.post<unknown, InteractionResponse>(`responses/interactions/`, {
                    study_step_id: studyStep?.id,
                    context_tag: targetTag,
                    payload_json: { selection: [selectionEntry] },
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interactions', studyStep?.id] });
        },
    });

    const handleMovieSelection = (id: string | null) => {
        setSelectedMovieId(id);
        if (id) {
            interactionMutation.mutate(id);
        }
    };

    useEffect(() => {
        if (isLoadingRecommendations) return;

        if (!isToggleDone) {
            setButtonControl({
                label: 'Finalize',
                action: () => setShowWarning(true),
                isDisabled: false,
            });
        } else {
            resetNextButton();
            driver({
                showProgress: true,
                steps: [
                    {
                        element: '.tour-select-button',
                        popover: {
                            title: 'Select a Movie',
                            description: 'Please select one movie from the list that best matches your mood.',
                            side: 'left',
                            align: 'start',
                        },
                    },
                ],
            }).drive();
        }
        return () => resetNextButton();
    }, [isLoadingRecommendations, isToggleDone, setButtonControl, resetNextButton]);

    useEffect(() => {
        if (isLoadingRecommendations || hasSeenTour) return;

        const timer = setTimeout(() => {
            driver({
                showProgress: true,
                steps: [
                    {
                        element: '#emotionPanel',
                        popover: {
                            title: 'Adjust Your Preferences',
                            description: `<p>You can control the emotions evoked by the recommended movies using these toggle buttons:</p>
                            <ul className="list-decimal list-inside">
                                <li><strong>Less</strong> means you prefer movies that evoke less of this emotion.</li>
                                <li><strong>More</strong> means you prefer movies that evoke more of this emotion.</li>
                            </ul>`,
                            side: 'right',
                            align: 'start',
                        },
                    },
                    {
                        element: '#moviePanel',
                        popover: {
                            title: 'Explore Recommendations',
                            description:
                                'This list contains your recommendations. Hover over each movie to see details.',
                            side: 'left',
                            align: 'start',
                        },
                    },
                    {
                        element: '#moviePosterPreview',
                        popover: {
                            title: 'Preview',
                            description: 'This panel contains the movie details such as the movie poster and synopsis.',
                            side: 'left',
                            align: 'start',
                        },
                    },
                ],
            }).drive();
            setHasSeenTour(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [isLoadingRecommendations, hasSeenTour]);

    if (!participant) {
        return <LoadingScreen loading={true} message="Loading recommendations..." />;
    }

    return (
        <div className="container mx-auto px-4">
            <WarningDialog
                show={showWarning}
                title="Are you sure?"
                message="Finalizing will freeze your current emotion settings. This action cannot be undone."
                onClose={setShowWarning}
                confirmCallback={() => {
                    setShowWarning(false);
                    setIsToggleDone(true);
                    setIsStepComplete(true);
                }}
                confirmText="Confirm"
                cancelCallback={() => setShowWarning(false)}
            />

            <div className="flex flex-wrap -mx-4" style={{ height: 'fit-content' }}>
                {/* Left Panel: Toggles */}
                <div id="emotionPanel" className="w-full lg:w-4/12 px-4">
                    {emoTogglesEnabled && (
                        <div className="emoPrefControlPanel">
                            <EmotionToggle
                                isFinal={isToggleDone || controlState === 'disabled'}
                                defaultLabel={defaultEmoWeightLabel}
                                emotionMap={emotionMap}
                                setEmotionMap={setEmotionMap}
                                loading={isLoadingRecommendations}
                            />
                        </div>
                    )}
                </div>

                {/* Middle Panel: Recommendations */}
                <div id="moviePanel" className="w-full lg:w-4/12 px-4 relative">
                    <MovieListPanel
                        id="leftPanel"
                        panelTitle="Recommendations"
                        loading={isLoadingRecommendations}
                        selectButtonEnabled={isToggleDone}
                        movies={recommendationsArray!}
                        activeMovieId={activeMovieId}
                        setActiveMovieId={setActiveMovieId}
                        selectedMovieId={selectedMovieId}
                        setSelectedMovieId={handleMovieSelection}
                    />
                </div>

                {/* Right Panel: Preview */}
                <div id="moviePosterPreview" className="w-full lg:w-4/12 px-4">
                    <MoviePreviewCard activeMovie={activeMovie} />
                    <hr className="my-2 border-gray-300" />
                    {ConditionalVisualizer && (
                        <div className="mt-1 justify-center">
                            <ConditionalVisualizer
                                movie={activeMovie}
                                emotionMeta={emotionsConfig}
                                movies={recommendationsArray}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmotionPreferences;
