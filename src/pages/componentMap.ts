import {
  DemographicsPage,
  MovieRatingPage,
  SurveyPage,
  FeedbackPage,
} from "@rssa-project/study-template";
import InformedConsent from "./ConsentPage";
import FinalPage from "./FinalPage";
import EmotionPreferences from "./emotionpreferences/EmotionPreferences";
import EmotionPreferencesWheelV2 from "./emotionpreferences/EmotionPreferencesWheelV2";
import EmotionPreferencesCombinedWheel from "./emotionpreferences/EmotionPreferencesCombinedWheel";
import EmotionPreferencesCombinedChart from "./emotionpreferences/EmotionPreferencesCombinedChart";
import ScenarioPage from "./ScenarioPage";
import StudyOverviewPage from "./StudyOverviewPage";

export const componentMap: { [key: string]: React.FC } = {
  ConsentStep: InformedConsent,
  StudyOverviewStep: StudyOverviewPage,
  InstructionStep: ScenarioPage,
  SurveyStep: SurveyPage,
  PreferenceElicitationStep: MovieRatingPage,

  // ── Switch TaskStep to test each condition locally ──────────────────────
 //TaskStep: EmotionPreferences,              // ← A: individual wheel (lollipop)
//TaskStep: EmotionPreferencesWheelV2,         // ← B: new individual wheel 
// TaskStep: EmotionPreferencesCombinedWheel, // ← C: combined wheel (7 spiders)
 TaskStep: EmotionPreferencesCombinedChart, // ← D: combined chart
  // ───────────────────────────────────────────────────────────────────────

 

  // Real study routing — do not change these
  CombinedWheelTask: EmotionPreferencesCombinedWheel,
  CombinedChartTask: EmotionPreferencesCombinedChart,
  ExtraStep: FeedbackPage,
  DemographicsStep: DemographicsPage,
  CompletionStep: FinalPage,
};