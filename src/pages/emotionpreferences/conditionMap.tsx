import React from "react";
import EmotionBars from "./EmotionBars";
import EmotionWheels from "./EmotionWheels";
import { EmotionMovieDetails } from "../../types/movies";

// Config from MovieEmotionPreviewPanel.tsx
const emotionsConfig = [
  { emo: "Joy", max: 0.318181818181818, min: 0.0382546323968918 },
  { emo: "Trust", max: 0.253994490358127, min: 0.0817610062893082 },
  { emo: "Fear", max: 0.209126984126984, min: 0.0273270708795901 },
  { emo: "Surprise", max: 0.166202984427503, min: 0.0256678889470927 },
  { emo: "Sadness", max: 0.188492063492063, min: 0.025706940874036 },
  { emo: "Disgust", max: 0.157538659793814, min: 0.00886524822695036 },
  { emo: "Anger", max: 0.182929272690844, min: 0.0161596958174905 },
  { emo: "Anticipation", max: 0.251623376623377, min: 0.0645546921697549 },
];

interface VizProps {
  movie: EmotionMovieDetails;
}

const BarsWrapper: React.FC<VizProps> = ({ movie }) => (
  <EmotionBars emotions={emotionsConfig} movie={movie} />
);

const WheelWrapper: React.FC<VizProps> = ({ movie }) => (
  <EmotionWheels emotions={emotionsConfig} movie={movie} variant="scaled" />
);

const WheelStraightWrapper: React.FC<VizProps> = ({ movie }) => (
  <EmotionWheels emotions={emotionsConfig} movie={movie} variant="straight" />
);

const WheelInverseWrapper: React.FC<VizProps> = ({ movie }) => (
  <EmotionWheels emotions={emotionsConfig} movie={movie} variant="inverse" />
);

const WheelRoundedWrapper: React.FC<VizProps> = ({ movie }) => (
  <EmotionWheels emotions={emotionsConfig} movie={movie} variant="rounded" />
);

export type ConditionConfig = {
  Visualizer: React.FC<VizProps>;
  controlState: "toggle" | "disabled" | "hidden";
  defaultEmoWeightLabel?: string;
};

export const conditionMap: Record<string, ConditionConfig> = {
  // Wheel Variations
  WHEEL_TOGGLE: {
    Visualizer: WheelWrapper,
    controlState: "toggle",
    defaultEmoWeightLabel: "Diversify",
  },
  WHEEL_DISABLED: {
    Visualizer: WheelWrapper,
    controlState: "disabled",
    defaultEmoWeightLabel: "Diversify",
  },
  WHEEL_HIDDEN: {
    Visualizer: WheelWrapper,
    controlState: "hidden",
    defaultEmoWeightLabel: "Diversify",
  },

  // Straight Wheel Variations
  WHEEL_STRAIGHT_TOGGLE: {
    Visualizer: WheelStraightWrapper,
    controlState: "toggle",
    defaultEmoWeightLabel: "Diversify",
  },

  // Bars Variations
  BARS_TOGGLE: {
    Visualizer: BarsWrapper,
    controlState: "toggle",
    defaultEmoWeightLabel: "Diversify",
  },

  // Default fallback
  DEFAULT: {
    Visualizer: WheelWrapper,
    controlState: "toggle",
    defaultEmoWeightLabel: "Diversify",
  },
};
