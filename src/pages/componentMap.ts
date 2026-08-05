import { DemographicsPage, FeedbackPage, FinalPage, MovieRatingPage, SurveyPage } from '@rssa-project/study-template';
import React from 'react';
import InformedConsent from './ConsentPage';
import EmotionPreferences from './emotionpreferences/EmotionPreferences';
import ScenarioPage from './ScenarioPage';
import StudyOverviewPage from './StudyOverviewPage';

export const componentMap: { [key: string]: React.FC } = {
    ConsentStep: InformedConsent,
    StudyOverviewStep: StudyOverviewPage,
    InstructionStep: ScenarioPage,
    SurveyStep: SurveyPage,
    PreferenceElicitationStep: (props) =>
        React.createElement(MovieRatingPage, {
            ...props,
            minRatingCount: 10,
            itemsPerPage: 18,
        }),

    TaskStep: EmotionPreferences, // See conditionMap.ts
    ExtraStep: FeedbackPage,
    DemographicsStep: (props) =>
        React.createElement(DemographicsPage, {
            ...props,
            iCountry: false,
            countryState: 'United States',
            iStateRegion: true,
            iUrbanicity: true,
            iAge: true,
            iGender: true,
            iRaceEthnicity: true,
            iEducation: true,
            stateRegionState: undefined,
        }),

    CompletionStep: FinalPage,
};
