import React from 'react';
import type { EmotionConfigMap, IERSViewProps } from '../../types/iers.types';
import CombinedWheelVisualizer from './visualizers/CombinedWheelVisualizer';
import DotPlotVisualizer from './visualizers/DotPlotVisualizer';
import LollipopVisualizer from './visualizers/LollipopVisualizer';
import EmotionWheelVisualizer from './visualizers/WheelVisualizer';

export const emotionsConfig: EmotionConfigMap = {
    joy: {
        label: 'Joy',
        max: 0.318181818181818,
        min: 0.0382546323968918,
        color: { hex: '#FFD700', hue: 48, saturation: 100 },
    },
    trust: {
        label: 'Trust',
        max: 0.253994490358127,
        min: 0.0817610062893082,
        color: { hex: '#6B8E23', hue: 88, saturation: 60 },
    },
    fear: {
        label: 'Fear',
        max: 0.209126984126984,
        min: 0.0273270708795901,
        color: { hex: '#228B22', hue: 130, saturation: 55 },
    },
    surprise: {
        label: 'Surprise',
        max: 0.166202984427503,
        min: 0.0256678889470927,
        color: { hex: '#87CEEB', hue: 207, saturation: 70 },
    },
    sadness: {
        label: 'Sadness',
        max: 0.188492063492063,
        min: 0.025706940874036,
        color: { hex: '#1E90FF', hue: 230, saturation: 50 },
    },
    disgust: {
        label: 'Disgust',
        max: 0.157538659793814,
        min: 0.00886524822695036,
        color: { hex: '#6A5ACD', hue: 275, saturation: 55 },
    },
    anger: {
        label: 'Anger',
        max: 0.182929272690844,
        min: 0.0161596958174905,
        color: { hex: '#FF4500', hue: 4, saturation: 85 },
    },
    anticipation: {
        label: 'Anticipation',
        max: 0.251623376623377,
        min: 0.0645546921697549,
        color: { hex: '#FF8C00', hue: 28, saturation: 95 },
    },
};

export type ConditionConfig = {
    Visualizer: React.FC<IERSViewProps> | null;
    controlState: 'toggle' | 'disabled' | 'hidden';
    defaultEmoWeightLabel?: string;
    // useCombinedWheel?: boolean;
    // useCombinedChart?: boolean;
};

export const conditionMap: Record<string, ConditionConfig> = {
    // Wheel Variations
    WHEEL_TOGGLE: {
        Visualizer: EmotionWheelVisualizer,
        controlState: 'toggle',
        defaultEmoWeightLabel: 'Diversify',
    },
    // Dotplots - Combined view
    DOTPLOT_TOGGLE: {
        Visualizer: DotPlotVisualizer,
        controlState: 'toggle',
        defaultEmoWeightLabel: 'Diversify',
    },
    // Lollipop — Individual chart condition
    LOLLIPOP_TOGGLE: {
        Visualizer: LollipopVisualizer,
        controlState: 'toggle',
        defaultEmoWeightLabel: 'Diversify',
    },

    // Combined Wheel — all 7 movies on one wheel
    COMBINED_WHEEL_TOGGLE: {
        Visualizer: CombinedWheelVisualizer,
        controlState: 'toggle',
        defaultEmoWeightLabel: 'Diversify',
        // useCombinedWheel: true,
    },
    NO_VIZ_TOGGLE: {
        Visualizer: null,
        controlState: 'toggle',
        defaultEmoWeightLabel: 'Diversify',
    },
};
