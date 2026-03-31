import { useMemo, useState, useEffect, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useStudy, useFetchParticipant } from "@rssa-project/api";
import {
  StudyLayoutContextType,
  useNextButtonControl,
  useStepCompletion,
  LoadingScreen,
  WarningDialog,
} from "@rssa-project/study-template";
import { useOutletContext } from "react-router-dom";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import { EmotionMovieDetails } from "../../types/movies";
import { emotionsDict } from "../../utils/constants";
import EmotionToggle from "./EmotionToggle";
import MovieListPanel from "./MovieListPanel";
import MoviePreviewCard from "./MoviePreviewCard";
import DotPlotVisualizer from "./DotPlotVisualizer";
import { useConditionMapping } from "../../hooks/useConditionMapping";
import { conditionMap } from "./conditionMap";

export type EmotionStatusValue = string;

type EmotionsPayload = {
  step_id: string;
  context_tag: string;
  emotion_input?: {
    emotion: string;
    weight: string;
  }[];
  tuning_tag?: string;
};

// Same emotions config as conditionMap
const emotionsConfig = [
  { emo: "Joy",          max: 0.318181818181818,  min: 0.0382546323968918 },
  { emo: "Trust",        max: 0.253994490358127,  min: 0.0817610062893082 },
  { emo: "Fear",         max: 0.209126984126984,  min: 0.0273270708795901 },
  { emo: "Surprise",     max: 0.166202984427503,  min: 0.0256678889470927 },
  { emo: "Sadness",      max: 0.188492063492063,  min: 0.025706940874036  },
  { emo: "Disgust",      max: 0.157538659793814,  min: 0.00886524822695036},
  { emo: "Anger",        max: 0.182929272690844,  min: 0.0161596958174905 },
  { emo: "Anticipation", max: 0.251623376623377,  min: 0.0645546921697549 },
];

const initialEmotionMap = new Map<string, EmotionStatusValue>(
  Object.entries(emotionsDict),
);

const EmotionPreferencesCombinedChart: React.FC = () => {
  const { studyStep, resetNextButton } =
    useOutletContext<StudyLayoutContextType>();
  const { setIsStepComplete } = useStepCompletion();
  const { studyApi } = useStudy();
  const { data: participant } = useFetchParticipant();

  const [emotionMap, setEmotionMap] =
    useState<Map<string, EmotionStatusValue>>(initialEmotionMap);

  const [hoveredMovieId, setHoveredMovieId] = useState<string | null>(null);
  const [activeMovieId, setActiveMovieId] = useState<string | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const [isToggleDone, setIsToggleDone] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [selectButtonEnabled, setSelectButtonEnabled] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  // ── Condition code ──────────────────────────────────────────────────────────
  // FOR LOCAL TESTING: hardcoded to "combined-chart"
  // FOR REAL STUDY: comment the line below and uncomment the line after it
  const externalCode = "combined-chart"; // ← local testing only
  // const externalCode = participant?.study_condition?.short_code; // ← real study
  // ───────────────────────────────────────────────────────────────────────────

  const { mappedCondition, isLoading: isMappingLoading } =
    useConditionMapping(externalCode);
  const conditionConfig = mappedCondition
    ? conditionMap[mappedCondition]
    : conditionMap["DEFAULT"];

  const controlState = conditionConfig?.controlState || "toggle";
  const defaultEmoWeightLabel =
    conditionConfig?.defaultEmoWeightLabel || "Ignore";

  const emoTogglesEnabled = controlState !== "hidden";
  const context_tag = externalCode || "ers-5";

  const contextData = useMemo(() => {
    const payload: EmotionsPayload = {
      step_id: studyStep?.id,
      context_tag: context_tag,
    };
    const isAllIgnored = Array.from(emotionMap.values()).every(
      (val) => val === "ignore",
    );
    if (isAllIgnored) {
      payload.context_tag = `${context_tag}-all-ignore`;
      return payload;
    }

    let contextString = "";
    const emotionInput = Array.from(emotionMap.entries()).map(
      ([emotion, weight]) => {
        if (weight !== "ignore") {
          contextString += `${emotion}-${weight},`;
        }
        return { emotion: emotion.toLowerCase(), weight };
      },
    );
    contextString = contextString.slice(0, -1);
    payload.context_tag = `${context_tag}-${contextString}`;
    payload.emotion_input = emotionInput;
    payload.tuning_tag = "emotion_tuning";
    return payload;
  }, [emotionMap, studyStep, context_tag]);

  const {
    data: moviesList = [],
    isLoading,
    isFetching,
    error,
  } = useQuery<EmotionMovieDetails[]>({
    queryKey: ["recommendations", contextData],
    queryFn: async () => {
      try {
        type RecResponse = {
          rec_type: string;
          items: EmotionMovieDetails[] | Record<string, EmotionMovieDetails>;
        };
        const response = await studyApi.post<any, RecResponse>(
          "recommendations/",
          contextData,
        );
        if (Array.isArray(response.items)) return response.items;
        else if (typeof response.items === "object" && response.items !== null)
          return Object.values(response.items);
        return [];
      } catch (err) {
        console.error("Query failed:", err);
        throw err;
      }
    },
    enabled: !!studyStep,
    staleTime: 0,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const loading = isLoading || isFetching || isMappingLoading;

  useEffect(() => {
    if (error) console.error("Query Error State:", error);
  }, [error]);

  const handleFinalize = useCallback(() => {
    setShowWarning(true);
  }, []);

  const { setButtonControl } = useNextButtonControl();

  useEffect(() => {
    if (loading) return;
    if (!isToggleDone) {
      setButtonControl({
        label: "Finalize",
        action: handleFinalize,
        isDisabled: false,
      });
    } else {
      resetNextButton();
      const driverObj = driver({
        showProgress: true,
        steps: [
          {
            element: ".tour-select-button",
            popover: {
              title: "Select a Movie",
              description:
                "Now that you have finalized your preferences, please select one movie from the list that best matches your mood.",
              side: "left",
              align: "start",
            },
          },
        ],
      });
      driverObj.drive();
    }
    return () => {
      resetNextButton();
    };
  }, [loading, isToggleDone, setButtonControl, handleFinalize, resetNextButton]);

  const queryClient = useQueryClient();

  const { data: interactions } = useQuery({
    queryKey: ["interactions", studyStep?.id],
    queryFn: async () => {
      return await studyApi.get<any[]>(
        `responses/interactions/${studyStep?.id}`,
      );
    },
    enabled: !!studyStep?.id,
  });

  const interactionMutation = useMutation({
    mutationFn: async (selectedId: string) => {
      const timestamp = new Date().toISOString();
      const selectionEntry = { timestamp, movie_id: selectedId };
      const targetTag = contextData.context_tag;
      const existing = interactions?.find(
        (i: any) => i.context_tag === targetTag,
      );
      if (existing) {
        const currentSelection = existing.payload_json.selection || [];
        const newPayload = {
          ...existing.payload_json,
          selection: [...currentSelection, selectionEntry],
        };
        await studyApi.patch(`responses/interactions/${existing.id}`, {
          id: existing.id,
          version: existing.version,
          payload_json: newPayload,
        });
        return {
          ...existing,
          version: existing.version + 1,
          payload_json: newPayload,
        };
      } else {
        return await studyApi.post(`responses/interactions/`, {
          study_step_id: studyStep?.id,
          context_tag: targetTag,
          payload_json: { selection: [selectionEntry] },
        });
      }
    },
    onSuccess: (result: any) => {
      queryClient.setQueryData(
        ["interactions", studyStep?.id],
        (old: any[]) => {
          const existing = old || [];
          const index = existing.findIndex((i: any) => i.id === result.id);
          if (index !== -1) {
            return existing.map((item: any, i: number) =>
              i === index ? result : item,
            );
          } else {
            return [...existing, result];
          }
        },
      );
    },
  });

  const handleMovieSelection = (id: string | null) => {
    setSelectedMovieId(id);
    if (id) interactionMutation.mutate(id);
  };

  // ── Intro Tour (same 3 steps as original) ─────────────────────────────────
  useEffect(() => {
    if (loading || hasSeenTour) return;

    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: "#emotionPanel",
          popover: {
            title: "Adjust Your Preferences",
            description: `<p>You can control the emotions evoked by the recommended movies using these toggle buttons:</p>
                        <ul className="list-decimal list-inside">
                            <li><strong>Less</strong> means you prefer movies with that evoke less of this emotion.</li>
                            <li><strong>More</strong> means you prefer movies that evoke more of this emotion.</li>
                            <li><strong>Diversify</strong> means that you want to diversify the recommendations along that emotional dimension.</li>
                        </ul>
                        <p>When you select a toggle, the recommendations will change accordingly.</p>`,
            side: "right",
            align: "start",
          },
        },
        {
          element: "#moviePanel",
          popover: {
            title: "Explore Recommendations",
            description:
              "This list contains your recommendations. You can hover over each movie to see more details about it in the panel on the right.",
            side: "left",
            align: "start",
          },
        },
        {
          element: "#combinedChartPanel",
          popover: {
            title: "Preview",
            description:
              "This panel contains the movie details such as the movie poster and synopsis.",
            side: "left",
            align: "start",
          },
        },
      ],
    });

    const timer = setTimeout(() => {
      driverObj.drive();
      setHasSeenTour(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [loading, hasSeenTour]);

  const movies = useMemo(() => {
    const map = new Map<string, EmotionMovieDetails>();
    moviesList.forEach((m) => map.set(m.id, m));
    return map;
  }, [moviesList]);

  const confirmWarning = () => {
    setShowWarning(false);
    setIsToggleDone(true);
    setSelectButtonEnabled(true);
    setIsStepComplete(true);
  };

  const cancelWarning = () => setShowWarning(false);

  if (isLoading) {
    return (
      <LoadingScreen loading={true} message="Loading recommendations..." />
    );
  }

  return (
    <div className="container mx-auto px-4">
      <WarningDialog
        show={showWarning}
        title={"Are you sure?"}
        message={`<p>Finalizing will freeze your current emotion settings.</p> 
                  <p>This action cannot be undone.</p>`}
        onClose={setShowWarning}
        confirmCallback={confirmWarning}
        confirmText={"Confirm"}
        cancelCallback={cancelWarning}
      />

      <div className="flex flex-wrap -mx-4" style={{ height: "fit-content" }}>

        {/* Left Panel: Emotion Toggles */}
        <div id="emotionPanel" className="w-full lg:w-4/12 px-4">
          <div className="emoPrefControlPanel">
            {emoTogglesEnabled && (
              <div>
                <EmotionToggle
                  isFinal={isToggleDone || controlState === "disabled"}
                  defaultLabel={defaultEmoWeightLabel}
                  emotionMap={emotionMap}
                  setEmotionMap={setEmotionMap}
                  loading={loading}
                />
              </div>
            )}
          </div>
        </div>

        {/* Middle Panel: Movie List */}
        <div
          id="moviePanel"
          className="w-full lg:w-4/12 px-4 relative"
          onMouseLeave={() => setHoveredMovieId(null)}
        >
          <MovieListPanel
            id="leftPanel"
            panelTitle={"Recommendations"}
            loading={loading}
            selectButtonEnabled={selectButtonEnabled}
            movies={movies}
            emotionMap={emotionMap}
            activeMovieId={activeMovieId}
            setActiveMovieId={(id) => {
              setActiveMovieId(id);
              setHoveredMovieId(id);
            }}
            selectedMovieId={selectedMovieId}
            setSelectedMovieId={handleMovieSelection}
          />
        </div>

        {/* Right Panel: Movie Info + Dot Plot / Lollipop */}
        <div id="combinedChartPanel" className="w-full lg:w-4/12 px-4">
          <div className="flex mx-auto moviePreviewPanel justify-center">
            <div className="container mx-auto">

              {/* Movie poster + synopsis — shown when hovering */}
              {hoveredMovieId && movies.get(hoveredMovieId) ? (
                <>
                  <div className="mt-3 h-[279px]">
                    <MoviePreviewCard activeMovie={movies.get(hoveredMovieId)!} />
                  </div>
                  <hr className="my-6 border-gray-300" />
                </>
              ) : (
                <div className="h-[279px] flex items-center justify-center">
                  <h5 className="text-center text-lg font-medium">
                    Select a movie to see its emotional signature
                  </h5>
                </div>
              )}

              {/* Dot plot / Lollipop chart */}
              <div className="flex flex-col items-center justify-start">
                <h5 className="text-lg font-medium text-center mb-1">
                  Emotional signature
                </h5>
                <p className="text-sm text-gray-400 text-center mb-3">
                  Hover a movie to highlight its profile
                </p>
                {movies.size > 0 ? (
                  <DotPlotVisualizer
                    movies={movies}
                    hoveredMovieId={hoveredMovieId}
                    emotions={emotionsConfig}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-400 text-sm">
                      Loading emotional profiles…
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmotionPreferencesCombinedChart;