import type { EmoStat, EmotionConfigMap, EmotionMovie, Emotions } from '../../types/iers.types';

export type PetalShapeType = 'fixed' | 'straight' | 'inverse' | 'rounded' | 'scaled';

export interface PetalSlice {
    startAngle: number;
    endAngle: number;
}

export function normalize(value: number, min: number, max: number): number {
    if (max === min) return 0;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

export const getMappedEmotionData = (movie: EmotionMovie, emotionMeta: EmotionConfigMap) => {
    if (!movie || !emotionMeta || !movie.emotions) return [];

    return (Object.entries(emotionMeta) as [keyof Emotions, EmoStat][]).map(([key, cfg]) => {
        const rawVal = movie.emotions?.[key] ?? 0;
        return {
            id: key,
            label: cfg.label,
            value: normalize(rawVal, cfg.min, cfg.max),
            color: cfg.color?.hex || '#cccccc',
        };
    });
};

export const getPolarPoint = (radius: number, angle: number) => ({
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
});

export const createPetalPath = (
    slice: PetalSlice,
    innerRadius: number,
    outerRadius: number,
    value: number = 1,
    type: PetalShapeType = 'fixed'
): string => {
    // Standard JS math uses 0 at 3 o'clock. We subtract PI/2 to rotate the start to 12 o'clock.
    const startAngle = slice.startAngle - Math.PI / 2;
    const endAngle = slice.endAngle - Math.PI / 2;
    const midAngle = (startAngle + endAngle) / 2;

    const start = getPolarPoint(innerRadius, startAngle);
    const end = getPolarPoint(innerRadius, endAngle);

    switch (type) {
        case 'straight': {
            const fillRadius = innerRadius + (outerRadius - innerRadius) * value;
            const tipStart = getPolarPoint(fillRadius, startAngle);
            const tipEnd = getPolarPoint(fillRadius, endAngle);
            return `M ${start.x},${start.y} L ${tipStart.x},${tipStart.y} L ${tipEnd.x},${tipEnd.y} L ${end.x},${end.y} Z`;
        }
        case 'inverse': {
            const fillInnerRadius = outerRadius - (outerRadius - innerRadius) * value;
            const outStart = getPolarPoint(outerRadius, startAngle);
            const outEnd = getPolarPoint(outerRadius, endAngle);
            const tip = getPolarPoint(outerRadius, midAngle);
            const baseStart = getPolarPoint(fillInnerRadius, startAngle);
            const baseEnd = getPolarPoint(fillInnerRadius, endAngle);
            return `M ${outStart.x},${outStart.y} L ${tip.x},${tip.y} L ${outEnd.x},${outEnd.y} L ${baseEnd.x},${baseEnd.y} L ${baseStart.x},${baseStart.y} Z`;
        }
        case 'rounded':
        case 'scaled':
        case 'fixed':
        default: {
            let targetRadius = outerRadius;
            if (type === 'rounded') {
                targetRadius = innerRadius + (outerRadius - innerRadius) * value;
            } else if (type === 'scaled') {
                targetRadius = innerRadius + (outerRadius - innerRadius) * value * 2;
            }

            const tip = getPolarPoint(targetRadius, midAngle);
            const cp1 = getPolarPoint(targetRadius * 0.6, startAngle);
            const cp2 = getPolarPoint(targetRadius * 0.6, endAngle);

            if (type === 'rounded') {
                const roundedTipArc = `A 10,10 0 0,1 ${tip.x},${tip.y}`;
                return `M ${start.x},${start.y} Q ${cp1.x},${cp1.y} ${tip.x},${tip.y} ${roundedTipArc} Q ${cp2.x},${cp2.y} ${end.x},${end.y} Z`;
            }

            return `M ${start.x},${start.y} Q ${cp1.x},${cp1.y} ${tip.x},${tip.y} Q ${cp2.x},${cp2.y} ${end.x},${end.y} Z`;
        }
    }
};

export const VISUALIZER_DIMENSIONS = {
    PADDING: 50,

    // Circular Charts (Wheels)
    WHEEL_BASE_SIZE: 200,
    WHEEL_COMBINED_SIZE: 235,

    // Linear Charts (Lollipop & Dot Plot)
    LINEAR_WIDTH: 280,
    LABEL_WIDTH: 90,
    ROW_HEIGHT_COMPACT: 28, // Lollipop
    ROW_HEIGHT_SPACED: 36, // Dot Plot
} as const;
