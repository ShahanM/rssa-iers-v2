import React, { useId, useMemo } from 'react';
import type { IERSViewProps } from '../../../types/iers.types';
import { createPetalPath, getMappedEmotionData, VISUALIZER_DIMENSIONS } from '../iers.utils';

interface PetalSlice {
    startAngle: number;
    endAngle: number;
}

const EmotionWheelVisualizer: React.FC<IERSViewProps> = ({ emotionMeta, movie, variant = 'scaled' }) => {
    const componentId = useId().replace(/:/g, '');

    const chartData = useMemo(() => {
        if (!movie || !emotionMeta || !movie.emotions) return null;

        const mappedData = getMappedEmotionData(movie, emotionMeta).map((d) => ({
            ...d,
            color: d.color + 'B2',
        }));

        const width = VISUALIZER_DIMENSIONS.WHEEL_BASE_SIZE;
        const height = VISUALIZER_DIMENSIONS.WHEEL_BASE_SIZE;
        const padding = VISUALIZER_DIMENSIONS.PADDING;

        const fullWidth = width + padding * 2;
        const fullHeight = height + padding * 2;

        const radius = Math.min(width, height) / 2;
        const labelRadius = radius * 1.19;
        const fixedInnerRadius = radius * 0.09;
        const fixedOuterRadius = radius;

        const numSlices = mappedData.length;
        const sliceAngle = (2 * Math.PI) / numSlices;

        const petals = mappedData.map((data, i) => {
            const startAngle = i * sliceAngle;
            const endAngle = (i + 1) * sliceAngle;
            const slice: PetalSlice = { startAngle, endAngle };

            const bgPath = createPetalPath(slice, fixedInnerRadius, fixedOuterRadius);
            const clipPath = createPetalPath(slice, fixedInnerRadius, fixedOuterRadius, data.value, variant);

            const angle = (startAngle + endAngle) / 2;
            const x = Math.cos(angle - Math.PI / 2) * labelRadius;
            const y = Math.sin(angle - Math.PI / 2) * labelRadius;

            const rotate =
                angle > Math.PI / 2 && angle < (3 * Math.PI) / 2
                    ? (angle * 180) / Math.PI + 180
                    : (angle * 180) / Math.PI;

            return {
                id: `${data.id}-${i}`,
                clipId: `clip-${componentId}-${i}`,
                bgPath,
                clipPath,
                color: data.color,
                label: data.label,
                labelTransform: `translate(${x}, ${y}) rotate(${rotate})`,
            };
        });

        return { fullWidth, fullHeight, petals };
    }, [emotionMeta, movie, variant, componentId]);

    if (!chartData) return null;

    return (
        <>
            <div className="mt-1 text-center">
                <h5 className="text-lg font-medium">Emotional signature</h5>
            </div>
            <svg width={chartData.fullWidth} height={chartData.fullHeight}>
                <g transform={`translate(${chartData.fullWidth / 2}, ${chartData.fullHeight / 2})`}>
                    <defs>
                        {chartData.petals.map((petal) => (
                            <clipPath id={petal.clipId} key={petal.clipId}>
                                <path d={petal.clipPath} />
                            </clipPath>
                        ))}
                    </defs>

                    {chartData.petals.map((petal) => (
                        <g key={petal.id}>
                            <path className="petal-bg" d={petal.bgPath} fill="#fff" stroke="#ccc" strokeWidth="1px" />
                            <path
                                className="petal-fill"
                                d={petal.bgPath}
                                fill={petal.color}
                                clipPath={`url(#${petal.clipId})`}
                                stroke="none"
                            />
                            <text
                                className="label"
                                transform={petal.labelTransform}
                                dy="0.35em"
                                textAnchor="middle"
                                style={{ fontSize: '12px', alignmentBaseline: 'middle' }}
                            >
                                {petal.label}
                            </text>
                        </g>
                    ))}
                </g>
            </svg>
        </>
    );
};

export default EmotionWheelVisualizer;
