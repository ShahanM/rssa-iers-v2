import {
  DemographicsPage,
  MovieRatingPage,
  SurveyPage,
  FeedbackPage,
} from "@rssa-project/study-template";
import InformedConsent from "./ConsentPage";
import FinalPage from "./FinalPage";
import EmotionPreferences from "./emotionpreferences/EmotionPreferences";
import ScenarioPage from "./ScenarioPage";
import StudyOverviewPage from "./StudyOverviewPage";

export const componentMap: { [key: string]: React.FC } = {
  ConsentStep: InformedConsent,
  StudyOverviewStep: StudyOverviewPage,
  InstructionStep: ScenarioPage,
  SurveyStep: SurveyPage,
  PreferenceElicitationStep: MovieRatingPage,
  TaskStep: EmotionPreferences,
  ExtraStep: FeedbackPage,
  DemographicsStep: DemographicsPage,
  CompletionStep: FinalPage,
};
