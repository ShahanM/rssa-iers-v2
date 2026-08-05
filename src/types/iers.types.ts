import type { Movie, MovieEmotions } from '@rssa-project/study-template';

export type RecommendationType = 'standard_emotion';

export interface EmotionColor {
    hex: string;
    hue?: number;
    saturation?: number;
}
export interface EmoStat {
    label: string;
    min: number;
    max: number;
    color?: EmotionColor;
}

export interface EmotionDataPoint1D {
    emotion: string;
    value: number;
    color: string;
}

export interface EmotionDataPoint2D {
    emotion: string;
    color: string;
    x: number;
    y: number;
}

export type Emotions = Omit<MovieEmotions, 'movie_id' | 'movielens_id' | 'id'>;
export type EmotionConfigMap = Record<keyof Emotions, EmoStat>;
export type EmotionMovie = Movie & {
    emotions: Emotions;
};

export interface IERSViewProps {
    emotionMeta: EmotionConfigMap;
    movie: EmotionMovie | null;
    movies?: EmotionMovie[];
    variant?: 'straight' | 'inverse' | 'rounded' | 'scaled';
}

export interface RecommendationRequestPayload {
    step_id: string;
    step_page_id?: string;
    context_tag: string;
    response_type?: RecommendationType;
    algorithm_key?: string;
}

export interface RecommendationResponsPayload {
    rec_type: string;
    items: EmotionMovie[];
}

export interface SelectionEntry {
    timestamp: string;
    movie_id: string;
}

export interface EmoToggleConfig {
    [key: string]: string | number;
}

export interface InteractionPayload {
    selection?: SelectionEntry[];
    [key: string]: string | number | SelectionEntry[] | undefined;
}

export interface InteractionResponse {
    id?: string;
    payload_json: InteractionPayload;
    version?: number;
}
