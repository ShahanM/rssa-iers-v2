import * as d3 from 'd3';
import React, { useMemo } from 'react';
import { type EmoStat, type EmotionDataPoint2D, type Emotions, type IERSViewProps } from '../../../types/iers.types';
import { normalize, VISUALIZER_DIMENSIONS } from '../iers.utils';

const DotPlotVisualizer: React.FC<IERSViewProps> = ({ emotionMeta, movie, movies = [] }) => {
    const hoveredMovieId = movie ? String(movie.id) : null;

    const chartData = useMemo(() => {
        if (!emotionMeta || Object.keys(emotionMeta).length === 0 || !movies.length) return null;

        const emotionEntries = Object.entries(emotionMeta) as [keyof Emotions, EmoStat][];

        const width = VISUALIZER_DIMENSIONS.LINEAR_WIDTH;
        const rowHeight = VISUALIZER_DIMENSIONS.ROW_HEIGHT_COMPACT;
        const labelWidth = VISUALIZER_DIMENSIONS.LABEL_WIDTH;

        const trackLeft = labelWidth + 12;
        const trackRight = 12;
        const trackWidth = width - trackLeft - trackRight;
        const dotR = 4;
        const height = emotionEntries.length * rowHeight + 8;

        const lineGenerator = d3
            .line<EmotionDataPoint2D>()
            .x((d) => d.x)
            .y((d) => d.y)
            .curve(d3.curveCatmullRom);

        const tracks = emotionEntries.map(([key, cfg], i) => ({
            key,
            label: cfg.label,
            y: i * rowHeight + rowHeight / 2 + 4,
        }));

        const sortedMovies = [...movies].sort((a, b) =>
            hoveredMovieId ? (String(a.id) === hoveredMovieId ? 1 : String(b.id) === hoveredMovieId ? -1 : 0) : 0
        );

        const lines = sortedMovies.map((dataMovie, mi) => {
            const isHovered = String(dataMovie.id) === hoveredMovieId;
            const hasHover = !!hoveredMovieId;

            const lineOp = isHovered ? 0.7 : hasHover ? 0.35 : 0.55;
            const dotOp = isHovered ? 1.0 : hasHover ? 0.45 : 0.85;
            const lw = isHovered ? 2.2 : 1.2;
            const dr = isHovered ? dotR + 1.5 : hasHover ? dotR - 0.5 : dotR;
            const strokeColor = isHovered ? '#888888' : hasHover ? '#cccccc' : '#999999';

            const jitter = hasHover ? 0 : (mi - (movies.length - 1) / 2) * 3.5;

            const pts = emotionEntries.map(([key, cfg], i) => {
                const rawVal = dataMovie.emotions?.[key] ?? 0;
                return {
                    x: trackLeft + normalize(rawVal, cfg.min, cfg.max) * trackWidth,
                    y: i * rowHeight + rowHeight / 2 + 4 + jitter,
                    emotion: cfg.label,
                    color: cfg.color?.hex || '#aaa',
                };
            });

            return {
                id: dataMovie.id,
                pathD: lineGenerator(pts) || '',
                pts,
                lineOp,
                dotOp,
                lw,
                dr,
                strokeColor,
                isHovered,
                hasHover,
            };
        });

        return { width, height, trackLeft, trackWidth, tracks, lines };
    }, [emotionMeta, movies, hoveredMovieId]);

    if (!chartData) return null;

    return (
        <>
            <div className="mt-1 text-center">
                <h5 className="text-lg font-medium">Emotional signature</h5>
            </div>
            <div>
                <svg width={chartData.width} height={chartData.height}>
                    {chartData.tracks.map((track) => (
                        <g key={`track-${track.key}`}>
                            <text
                                x={90}
                                y={track.y}
                                textAnchor="end"
                                dominantBaseline="middle"
                                style={{ fontSize: '12px', fill: '#4a5568', fontFamily: 'Segoe UI, sans-serif' }}
                            >
                                {track.label}
                            </text>
                            <rect
                                x={chartData.trackLeft}
                                y={track.y - 11}
                                width={chartData.trackWidth}
                                height={22}
                                rx={4}
                                fill="#f8fafc"
                                stroke="#e2e8f0"
                                strokeWidth={0.8}
                            />
                            <line
                                x1={chartData.trackLeft}
                                x2={chartData.trackLeft + chartData.trackWidth}
                                y1={track.y}
                                y2={track.y}
                                stroke="#e9ecef"
                                strokeWidth={0.8}
                            />
                        </g>
                    ))}

                    {chartData.lines.map((line) => (
                        <g key={`movie-${line.id}`}>
                            <path
                                d={line.pathD}
                                fill="none"
                                stroke={line.strokeColor}
                                strokeWidth={line.lw}
                                strokeOpacity={line.lineOp}
                                strokeLinecap="round"
                            />
                            {line.pts.map((p, i) => (
                                <circle
                                    key={`dot-${line.id}-${p.emotion}-${i}`}
                                    cx={p.x}
                                    cy={p.y}
                                    r={line.dr}
                                    fill={line.isHovered || !line.hasHover ? p.color : '#cccccc'}
                                    stroke="white"
                                    strokeWidth={1.5}
                                    opacity={line.dotOp}
                                />
                            ))}
                        </g>
                    ))}
                </svg>
            </div>
        </>
    );
};

export default DotPlotVisualizer;
