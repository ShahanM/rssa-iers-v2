import { Movie } from "@rssa-project/study-template";

export type MovieEmotions = {
  id: string;
  anger: number;
  anticipation: number;
  disgust: number;
  fear: number;
  joy: number;
  sadness: number;
  surprise: number;
  trust: number;
};

export type EmotionMovieDetails = Movie & {
  emotions: MovieEmotions;
};
