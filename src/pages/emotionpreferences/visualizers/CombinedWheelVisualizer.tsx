import React, { useId, useMemo } from 'react';
import type { EmoStat, Emotions, IERSViewProps } from '../../../types/iers.types';
import { createPetalPath, getPolarPoint, normalize } from '../iers.utils';

const size = 235;

const CombinedWheelVisualizer: React.FC<IERSViewProps> = ({ movies, movie, emotionMeta }) => {
    const componentId = useId().replace(/:/g, '');
    const clipId = `wheel-clip-${componentId}`;
    const shadowId = `sp-shadow-${componentId}`;

    const chartData = useMemo(() => {
        if (!emotionMeta) return null;

        const targetMovies = movies && movies.length > 0 ? movies : movie ? [movie] : [];
        if (targetMovies.length === 0) return null;

        const emotionEntries = Object.entries(emotionMeta) as [keyof Emotions, EmoStat][];

        const n = emotionEntries.length;
        const sliceAng = (2 * Math.PI) / n;
        const nMovies = targetMovies.length;

        const padding = 44;
        const totalSz = size + padding * 2;
        const cx = totalSz / 2;
        const cy = totalSz / 2;
        const outerR = size / 2;
        const innerR = outerR * 0.08;
        const labelR = outerR * 1.2;

        const basePetals = emotionEntries.map(([key, cfg], i) => {
            const sa = i * sliceAng;
            const ea = sa + sliceAng;
            const ma = (sa + ea) / 2 - Math.PI / 2;

            const path = createPetalPath({ startAngle: sa, endAngle: ea }, innerR, outerR, 1, 'fixed');
            const labelPos = getPolarPoint(labelR, ma);

            return { id: key, path, label: cfg.label, labelX: labelPos.x, labelY: labelPos.y };
        });

        const focusId = movie?.id ?? null;
        const anyFocus = focusId !== null;

        const sortedMovies = [...targetMovies].sort((a, b) => {
            if (!anyFocus) return 0;
            return a.id === focusId ? 1 : b.id === focusId ? -1 : 0;
        });

        const spiders = sortedMovies.map((m, mi) => {
            const origIdx = targetMovies.findIndex((orig) => orig.id === m.id);
            const isFocused = !anyFocus || m.id === focusId;

            const depthScale = 1 + (nMovies - 1 - origIdx) * 0.1;
            const fillOp = !anyFocus ? 0.06 + origIdx * (0.2 / nMovies) : isFocused ? 0.35 : 0.12;
            const alpha = !anyFocus ? 0.3 + origIdx * (0.65 / nMovies) : isFocused ? 1.0 : 0.45;
            const lineW = !anyFocus ? 0.6 + origIdx * (1.0 / nMovies) : isFocused ? 2.5 : 1.0;
            const dotR = !anyFocus ? 1.5 + origIdx * (2.0 / nMovies) : isFocused ? 5.0 : 2.5;

            const isGray = anyFocus && !isFocused;

            const angleOff = (origIdx - (nMovies - 1) / 2) * 0.022;

            const pts = emotionEntries.map(([key, cfg], i) => {
                const ma = i * sliceAng - Math.PI / 2 + sliceAng / 2 + angleOff;
                const rawVal = m.emotions?.[key] ?? 0;
                const score = normalize(rawVal, cfg.min, cfg.max);
                const dist = Math.min(innerR + score * (outerR - innerR - 10) * depthScale + 8, outerR - 2);
                const pt = getPolarPoint(dist, ma);

                const color = isGray ? '#cccccc' : cfg.color?.hex || '#aaaaaa';

                return { ...pt, dist, color, sa: i * sliceAng - Math.PI / 2 + angleOff };
            });

            const sectors = pts.map((p) => {
                const ea = p.sa + sliceAng;
                const p1 = getPolarPoint(p.dist, p.sa);
                const p2 = getPolarPoint(p.dist, ea);
                return { points: `0,0 ${p1.x},${p1.y} ${p.x},${p.y} ${p2.x},${p2.y}`, color: p.color };
            });

            const outlines = pts.map((p) => {
                const ea = p.sa + sliceAng;
                const pathD = createPetalPath(
                    { startAngle: p.sa + Math.PI / 2, endAngle: ea + Math.PI / 2 },
                    innerR,
                    p.dist,
                    1,
                    'fixed'
                );
                return {
                    d: pathD,
                    color: p.color,
                };
            });

            const webLines = pts.map((p, i) => {
                const next = pts[(i + 1) % pts.length];
                return { x1: p.x, y1: p.y, x2: next.x, y2: next.y, color: p.color };
            });

            return {
                id: m.id || mi,
                filter: !anyFocus || isFocused ? `url(#${shadowId})` : 'none',
                fillOp,
                alpha,
                lineW,
                dotR,
                pts,
                sectors,
                outlines,
                webLines,
            };
        });

        return { totalSz, cx, cy, innerR, basePetals, spiders };
    }, [movie, movies, emotionMeta, shadowId]);
    if (!chartData) return <>Loading Movies...</>;

    return (
        <>
            <div className="mt-1 text-center">
                <h5 className="text-lg font-medium">Emotional signature</h5>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg width={chartData.totalSz} height={chartData.totalSz}>
                    <defs>
                        <filter id={shadowId} x="-30%" y="-30%" width="160%" height="160%">
                            <feDropShadow dx={1} dy={2} stdDeviation={2} floodColor="#00000033" />
                        </filter>

                        <clipPath id={clipId}>
                            {chartData.basePetals.map((p) => (
                                <path key={`clip-${p.id}`} d={p.path} />
                            ))}
                        </clipPath>
                    </defs>

                    <g transform={`translate(${chartData.cx},${chartData.cy})`}>
                        {chartData.basePetals.map((p) => (
                            <path key={`base-${p.id}`} d={p.path} fill="#ffffff" stroke="#cccccc" strokeWidth={1} />
                        ))}

                        {chartData.spiders.map((spider) => (
                            <g key={`spider-${spider.id}`} filter={spider.filter}>
                                <g clipPath={`url(#${clipId})`}>
                                    {spider.sectors.map((s, i) => (
                                        <polygon
                                            key={`sec-${i}`}
                                            points={s.points}
                                            fill={s.color}
                                            fillOpacity={spider.fillOp}
                                            stroke="none"
                                        />
                                    ))}
                                    {spider.outlines.map((o, i) => (
                                        <path
                                            key={`out-${i}`}
                                            d={o.d}
                                            fill="none"
                                            stroke={o.color}
                                            strokeWidth={spider.lineW}
                                            strokeOpacity={spider.alpha}
                                        />
                                    ))}
                                </g>

                                {spider.webLines.map((w, i) => (
                                    <line
                                        key={`line-${i}`}
                                        x1={w.x1}
                                        y1={w.y1}
                                        x2={w.x2}
                                        y2={w.y2}
                                        stroke={w.color}
                                        strokeWidth={spider.lineW}
                                        strokeOpacity={spider.alpha}
                                        strokeLinecap="round"
                                    />
                                ))}

                                {spider.pts.map((p, i) => (
                                    <circle
                                        key={`dot-${i}`}
                                        cx={p.x}
                                        cy={p.y}
                                        r={spider.dotR}
                                        fill={p.color}
                                        stroke="#fff"
                                        strokeWidth={1}
                                        opacity={spider.alpha}
                                    />
                                ))}
                            </g>
                        ))}

                        {chartData.basePetals.map((p) => (
                            <g key={`top-${p.id}`}>
                                <path d={p.path} fill="none" stroke="#bbbbbb" strokeWidth={0.8} />
                                <text
                                    x={p.labelX}
                                    y={p.labelY}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    style={{
                                        fontSize: '11px',
                                        fontFamily: 'Segoe UI, Arial, sans-serif',
                                        fill: '#333',
                                    }}
                                >
                                    {p.label}
                                </text>
                            </g>
                        ))}
                        <circle r={chartData.innerR} fill="#fff" stroke="#ccc" strokeWidth={1} />
                    </g>
                </svg>
            </div>
        </>
    );
};

export default CombinedWheelVisualizer;
