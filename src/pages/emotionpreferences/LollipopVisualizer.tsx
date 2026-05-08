import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { EmotionMovieDetails } from "../../types/movies";

interface EmotionConfig {
  emo: string;
  max: number;
  min: number;
}

interface LollipopVisualizerProps {
  emotions: EmotionConfig[];
  movie: EmotionMovieDetails;
}

// Official PyPlutchik colors — same as wheel and combined visualizer
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

// Normalize a raw score to 0–1 using the same min/max as the wheel
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

// Extract emotion score from movie data (handles both object and array formats)
function getEmotionScore(
  movie: EmotionMovieDetails,
  emoName: string,
): number {
  const key = emoName.toLowerCase();
  if (movie.emotions && typeof movie.emotions === "object" && !Array.isArray(movie.emotions)) {
    return (movie.emotions as Record<string, number>)[key] ?? 0;
  }
  if (Array.isArray(movie.emotion_scores)) {
    const entry = movie.emotion_scores.find(
      (e: any) => e.emotion?.toLowerCase() === key,
    );
    return entry?.value ?? entry?.score ?? 0;
  }
  return 0;
}

const LollipopVisualizer: React.FC<LollipopVisualizerProps> = ({
  emotions,
  movie,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!movie || !emotions?.length) return;
    draw();
  }, [movie, emotions]);

  const draw = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 260;
    const rowHeight = 28;
    const labelWidth = 88;
    const trackLeft = labelWidth + 12;
    const trackRight = 16;
    const trackWidth = width - trackLeft - trackRight;
    const dotR = 6;
    const height = emotions.length * rowHeight + 8;

    svg.attr("width", width).attr("height", height);

    const g = svg.append("g");

    emotions.forEach((cfg, i) => {
      const raw = getEmotionScore(movie, cfg.emo);
      const norm = normalize(raw, cfg.min, cfg.max);
      const color = EMO_COLORS[cfg.emo] || "#aaa";
      const y = i * rowHeight + rowHeight / 2 + 4;
      const x = trackLeft + norm * trackWidth;

      const row = g.append("g");

      // Emotion label
      row
        .append("text")
        .attr("x", labelWidth)
        .attr("y", y)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .style("font-size", "12px")
        .style("fill", "#4a5568")
        .style("font-family", "Segoe UI, sans-serif")
        .text(cfg.emo);

      // Track background
      row
        .append("rect")
        .attr("x", trackLeft)
        .attr("y", y - 10)
        .attr("width", trackWidth)
        .attr("height", 20)
        .attr("rx", 5)
        .attr("fill", "#f7f9fc")
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", 1);

      // Center axis line
      row
        .append("line")
        .attr("x1", trackLeft)
        .attr("x2", trackLeft + trackWidth)
        .attr("y1", y)
        .attr("y2", y)
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", 1);

      // Lollipop stem — from track start to dot
      row
        .append("line")
        .attr("x1", trackLeft)
        .attr("x2", x)
        .attr("y1", y)
        .attr("y2", y)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("opacity", 0.5);

      // Lollipop dot
      row
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", dotR)
        .attr("fill", color)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.15))");
    });


  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <svg ref={svgRef} />
    </div>
  );
};

export default LollipopVisualizer;