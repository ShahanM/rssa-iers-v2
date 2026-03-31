import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { EmotionMovieDetails } from "../../types/movies";

interface EmotionConfig {
  emo: string;
  max: number;
  min: number;
}

interface DotPlotVisualizerProps {
  movies: Map<string, EmotionMovieDetails>;
  hoveredMovieId: string | null;
  emotions: EmotionConfig[];
  size?: number;
}

// Official PyPlutchik colors
const EMO_COLORS: Record<string, string> = {
  Joy:          "#FFD700",
  Trust:        "#6B8E23",
  Fear:         "#228B22",
  Surprise:     "#87CEEB",
  Sadness:      "#1E90FF",
  Disgust:      "#6A5ACD",
  Anger:        "#FF4500",
  Anticipation: "#FF8C00",
};

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function getEmotionScore(movie: EmotionMovieDetails, emoName: string): number {
  const key = emoName.toLowerCase();
  if (movie.emotions && typeof movie.emotions === "object" && !Array.isArray(movie.emotions)) {
    return (movie.emotions as Record<string, number>)[key] ?? 0;
  }
  if (Array.isArray(movie.emotion_scores)) {
    const entry = movie.emotion_scores.find((e: any) => e.emotion?.toLowerCase() === key);
    return entry?.value ?? entry?.score ?? 0;
  }
  return 0;
}

const DotPlotVisualizer: React.FC<DotPlotVisualizerProps> = ({
  movies,
  hoveredMovieId,
  emotions,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!emotions?.length || movies.size === 0) return;
    draw();
  }, [movies, hoveredMovieId, emotions]);

  const draw = () => {
    const svg        = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width      = 280;
    const rowHeight  = 36;
    const labelWidth = 90;
    const trackLeft  = labelWidth + 12;
    const trackRight = 12;
    const trackWidth = width - trackLeft - trackRight;
    const dotR       = 4;
    const height     = emotions.length * rowHeight + 8;

    svg.attr("width", width).attr("height", height);

    const movieList    = Array.from(movies.values());
    const hoveredMovie = hoveredMovieId ? movies.get(hoveredMovieId) ?? null : null;
    const anyHover     = hoveredMovieId !== null;

    // ── Draw tracks + labels ──────────────────────────────────────────────────
    emotions.forEach((cfg, i) => {
      const y = i * rowHeight + rowHeight / 2 + 4;

      svg.append("text")
        .attr("x", labelWidth).attr("y", y)
        .attr("text-anchor", "end").attr("dominant-baseline", "middle")
        .style("font-size", "12px").style("fill", "#4a5568")
        .style("font-family", "Segoe UI, sans-serif")
        .text(cfg.emo);

      svg.append("rect")
        .attr("x", trackLeft).attr("y", y - 11)
        .attr("width", trackWidth).attr("height", 22).attr("rx", 4)
        .attr("fill", "#f8fafc").attr("stroke", "#e2e8f0").attr("stroke-width", 0.8);

      svg.append("line")
        .attr("x1", trackLeft).attr("x2", trackLeft + trackWidth)
        .attr("y1", y).attr("y2", y)
        .attr("stroke", "#e9ecef").attr("stroke-width", 0.8);
    });

    // ── Draw one line + dots per movie ────────────────────────────────────────
    if (hoveredMovie) {
      // ── HOVER MODE: hovered movie full color, others gray traces ─────────
      const sorted = [...movieList].sort((a, b) =>
        a.id === hoveredMovieId ? 1 : b.id === hoveredMovieId ? -1 : 0
      );

      sorted.forEach((movie) => {
        const isHovered = movie.id === hoveredMovieId;
        const lineOp = isHovered ? 0.70 : 0.35;
        const dotOp  = isHovered ? 1.00 : 0.45;
        const lw     = isHovered ? 2.2  : 1.2;
        const dr     = isHovered ? dotR + 1.5 : dotR - 0.5;

        const pts = emotions.map((cfg, i) => ({
          x: trackLeft + normalize(getEmotionScore(movie, cfg.emo), cfg.min, cfg.max) * trackWidth,
          y: i * rowHeight + rowHeight / 2 + 4,
          emo: cfg.emo,
        }));

        // Gray connecting line
        svg.append("path")
          .attr("d", d3.line<any>().x(d => d.x).y(d => d.y)
            .curve(d3.curveCatmullRom)(pts))
          .attr("fill", "none")
          .attr("stroke", isHovered ? "#888888" : "#cccccc")
          .attr("stroke-width", lw)
          .attr("stroke-opacity", lineOp)
          .attr("stroke-linecap", "round");

        // Dots — emotion color when hovered, gray when not
        pts.forEach((p) => {
          svg.append("circle")
            .attr("cx", p.x).attr("cy", p.y).attr("r", dr)
            .attr("fill", isHovered ? EMO_COLORS[p.emo] || "#aaa" : "#cccccc")
            .attr("stroke", "white").attr("stroke-width", 1.5)
            .attr("opacity", dotOp);
        });
      });

    } else {
      // ── NO HOVER MODE: all movies with gray lines, emotion colored dots ───
      // Use seeded jitter so dots don't overlap — consistent per movie
      movieList.forEach((movie, mi) => {
        const jitter = (mi - (movieList.length - 1) / 2) * 3.5; // spread vertically

        const pts = emotions.map((cfg, i) => ({
          x: trackLeft + normalize(getEmotionScore(movie, cfg.emo), cfg.min, cfg.max) * trackWidth,
          y: i * rowHeight + rowHeight / 2 + 4 + jitter,
          emo: cfg.emo,
        }));

        // Gray connecting line
        svg.append("path")
          .attr("d", d3.line<any>().x(d => d.x).y(d => d.y)
            .curve(d3.curveCatmullRom)(pts))
          .attr("fill", "none")
          .attr("stroke", "#999999")
          .attr("stroke-width", 1.2)
          .attr("stroke-opacity", 0.55)
          .attr("stroke-linecap", "round");

        // Emotion colored dots
        pts.forEach((p) => {
          svg.append("circle")
            .attr("cx", p.x).attr("cy", p.y).attr("r", dotR)
            .attr("fill", EMO_COLORS[p.emo] || "#aaa")
            .attr("stroke", "white").attr("stroke-width", 1.5)
            .attr("opacity", 0.85);
        });
      });
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <svg ref={svgRef} />
    </div>
  );
};

export default DotPlotVisualizer;
