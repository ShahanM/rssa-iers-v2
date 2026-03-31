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
import CombinedWheelVisualizer from "./CombinedWheelVisualizer";
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

const initialEmotionMap = new Map<string, EmotionStatusValue>(
  Object.entries(emotionsDict),
);

const EmotionPreferencesCombinedWheel: React.FC = () => {
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
  // FOR LOCAL TESTING: hardcoded to "combined-wheel"
  // FOR REAL STUDY: comment the line below and uncomment the line after it
  const externalCode = "combined-wheel"; // ← local testing only
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
          element: "#combinedWheelPanel",
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

        {/* Middle Panel: MiniPreferenceWheel + movie list */}
        <div
          id="moviePanel"
          className="w-full lg:w-4/12 px-4 relative"
          onMouseLeave={() => setHoveredMovieId(null)}
        >
          <div className="flex flex-col items-center justify-center bg-gray-200 rounded-t-md p-2 text-center">
            <h5 className="text-lg font-medium">Recommendations</h5>
          </div>
          <div className="relative flex-grow" style={{ minHeight: "504px" }}>
            {loading && (
              <div className="absolute inset-0 bg-black opacity-30 z-50 rounded-b-md flex items-center justify-center">
                <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            <ul className="list-none p-0 m-0 overflow-y-auto h-full border border-gray-200 rounded-b-md bg-white">
              {[...movies.values()].map(movie => (
                <div
                  key={movie.id}
                  className={`flex justify-between items-center p-1 border-b border-gray-200 hover:bg-gray-50 transition-colors ${movie.id === activeMovieId ? "bg-amber-100" : ""}`}
                  onMouseEnter={() => { setActiveMovieId(movie.id); setHoveredMovieId(movie.id); }}
                >
                  <div>
                    <img className="w-[45px] h-[67px] object-cover rounded" src={movie.poster} alt={movie.title} />
                  </div>
                  <div className="relative w-[87%] inline-block align-middle">
                    <p className="mb-0 mt-1 text-left ml-2 text-sm font-medium text-gray-700">
                      {movie.title + " (" + movie.year + ")"}
                    </p>
                  </div>
                  {selectButtonEnabled && (
                    <div id={"selectButton_" + movie.id} className="tour-select-button">
                      {movie.id === selectedMovieId ? (
                        <button className="px-3 py-1 text-xs font-medium rounded bg-green-500 text-white cursor-default">Selected</button>
                      ) : (
                        <button className="px-3 py-1 text-xs font-medium rounded bg-amber-500 text-white hover:bg-amber-600 transition-colors" onClick={() => handleMovieSelection(movie.id)}>Select</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Panel: Combined Wheel */}
        <div id="combinedWheelPanel" className="w-full lg:w-4/12 px-4">
          <div className="flex flex-col items-center justify-start pt-4">
            <h5 className="text-lg font-medium text-center mb-1">
              Emotional signature
            </h5>
            <p className="text-sm text-gray-400 text-center mb-3">
              Hover a movie to highlight its profile
            </p>
            {movies.size > 0 ? (
              <CombinedWheelVisualizer
                movies={movies}
                hoveredMovieId={hoveredMovieId}
                emotionMap={emotionMap}
                size={260}
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
  );
};

export default EmotionPreferencesCombinedWheel;
