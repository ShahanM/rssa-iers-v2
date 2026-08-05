import React, { useMemo } from 'react';
import type { IERSViewProps } from '../../../types/iers.types';
import { getMappedEmotionData, VISUALIZER_DIMENSIONS } from '../iers.utils';

const LollipopVisualizer: React.FC<IERSViewProps> = ({ emotionMeta, movie }) => {
    const chartData = useMemo(() => {
        if (!movie || !emotionMeta || !movie.emotions) return null;

        const mappedData = getMappedEmotionData(movie, emotionMeta);

        const width = VISUALIZER_DIMENSIONS.LINEAR_WIDTH;
        const rowHeight = VISUALIZER_DIMENSIONS.ROW_HEIGHT_COMPACT;
        const labelWidth = VISUALIZER_DIMENSIONS.LABEL_WIDTH;

        const trackLeft = labelWidth + 12;
        const trackRight = 16;
        const trackWidth = width - trackLeft - trackRight;
        const dotR = 6;
        const height = mappedData.length * rowHeight + 8;

        const rows = mappedData.map((data, i) => {
            const y = i * rowHeight + rowHeight / 2 + 4;
            const x = trackLeft + data.value * trackWidth;

            return { ...data, x, y };
        });

        return { width, height, trackLeft, trackWidth, labelWidth, dotR, rows };
    }, [emotionMeta, movie]);

    if (!chartData) return null;

    return (
        <>
            <div className="mt-1 text-center">
                <h5 className="text-lg font-medium">Emotional signature</h5>
            </div>
            <div>
                <svg width={chartData.width} height={chartData.height}>
                    {chartData.rows.map((row) => (
                        <g key={`lollipop-row-${row.id}`}>
                            <text
                                x={chartData.labelWidth}
                                y={row.y}
                                textAnchor="end"
                                dominantBaseline="middle"
                                style={{ fontSize: '12px', fill: '#4a5568', fontFamily: 'Segoe UI, sans-serif' }}
                            >
                                {row.label}
                            </text>

                            <rect
                                x={chartData.trackLeft}
                                y={row.y - 10}
                                width={chartData.trackWidth}
                                height={20}
                                rx={5}
                                fill="#f7f9fc"
                                stroke="#e2e8f0"
                                strokeWidth={1}
                            />

                            <line
                                x1={chartData.trackLeft}
                                x2={chartData.trackLeft + chartData.trackWidth}
                                y1={row.y}
                                y2={row.y}
                                stroke="#e2e8f0"
                                strokeWidth={1}
                            />

                            <line
                                x1={chartData.trackLeft}
                                x2={row.x}
                                y1={row.y}
                                y2={row.y}
                                stroke={row.color}
                                strokeWidth={2}
                                opacity={0.5}
                            />

                            <circle
                                cx={row.x}
                                cy={row.y}
                                r={chartData.dotR}
                                fill={row.color}
                                stroke="white"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }}
                            />
                        </g>
                    ))}
                </svg>
            </div>
        </>
    );
};

export default LollipopVisualizer;
