import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { EmotionMovieDetails } from "../../types/movies";

// Official PyPlutchik colors — same as CombinedWheelVisualizer
const EMOTIONS = [
  { name: "Joy",          color: "#FFD700", h: 48,  s: 100 },
  { name: "Trust",        color: "#6B8E23", h: 88,  s: 60  },
  { name: "Fear",         color: "#228B22", h: 130, s: 55  },
  { name: "Surprise",     color: "#87CEEB", h: 207, s: 70  },
  { name: "Sadness",      color: "#1E90FF", h: 230, s: 50  },
  { name: "Disgust",      color: "#6A5ACD", h: 275, s: 55  },
  { name: "Anger",        color: "#FF4500", h: 4,   s: 85  },
  { name: "Anticipation", color: "#FF8C00", h: 28,  s: 95  },
];

const emotionsConfig = [
  { emo: "Joy",          max: 0.318181818181818,  min: 0.0382546323968918  },
  { emo: "Trust",        max: 0.253994490358127,  min: 0.0817610062893082  },
  { emo: "Fear",         max: 0.209126984126984,  min: 0.0273270708795901  },
  { emo: "Surprise",     max: 0.166202984427503,  min: 0.0256678889470927  },
  { emo: "Sadness",      max: 0.188492063492063,  min: 0.025706940874036   },
  { emo: "Disgust",      max: 0.157538659793814,  min: 0.00886524822695036 },
  { emo: "Anger",        max: 0.182929272690844,  min: 0.0161596958174905  },
  { emo: "Anticipation", max: 0.251623376623377,  min: 0.0645546921697549  },
];

interface MovieEmotionWheelProps {
  movie: EmotionMovieDetails | null;
  size?: number;
}

function normalizeEmotion(emoName: string, rawValue: number): number {
  const cfg = emotionsConfig.find(e => e.emo.toLowerCase() === emoName.toLowerCase());
  if (!cfg) return rawValue;
  return Math.min(1, Math.max(0, (rawValue - cfg.min) / (cfg.max - cfg.min)));
}

function getEmotionScore(movie: EmotionMovieDetails, emoName: string): number {
  const emotionsObj = (movie as any).emotions;
  if (emotionsObj && typeof emotionsObj === "object" && !Array.isArray(emotionsObj)) {
    const raw = emotionsObj[emoName] ?? emotionsObj[emoName.toLowerCase()];
    if (raw !== undefined) return normalizeEmotion(emoName, raw);
  }
  const scores = (movie as any).emotion_scores;
  if (Array.isArray(scores)) {
    const found = scores.find((s: any) => s.emotion?.toLowerCase() === emoName.toLowerCase());
    if (found) return normalizeEmotion(emoName, found.score ?? found.value ?? 0);
  }
  return 0;
}

const MovieEmotionWheel: React.FC<MovieEmotionWheelProps> = ({
  movie,
  size = 260,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    draw();
  }, [movie, size]);

  const draw = () => {
    const padding  = 44;
    const totalSz  = size + padding * 2;
    const cx       = totalSz / 2;
    const cy       = totalSz / 2;
    const outerR   = size / 2;
    const innerR   = outerR * 0.08;
    const labelR   = outerR * 1.2;
    const n        = EMOTIONS.length;
    const sliceAng = (2 * Math.PI) / n;

    const svgEl = svgRef.current!;
    d3.select(svgEl).selectAll("*").remove();
    d3.select(svgEl).attr("width", totalSz).attr("height", totalSz);

    const root = d3.select(svgEl);
    const defs = root.append("defs");

    // Drop shadow filter
    const filt = defs.append("filter")
      .attr("id", "mew-shadow")
      .attr("x", "-30%").attr("y", "-30%")
      .attr("width", "160%").attr("height", "160%");
    filt.append("feDropShadow")
      .attr("dx", 1).attr("dy", 2)
      .attr("stdDeviation", 2)
      .attr("flood-color", "#00000033");

    const g = root.append("g").attr("transform", `translate(${cx},${cy})`);

    // Petal bezier path helper
    function petalPath(i: number, inner: number, outer: number): string {
      const sa = i * sliceAng - Math.PI / 2;
      const ea = sa + sliceAng;
      const ma = (sa + ea) / 2;
      const sx = inner * Math.cos(sa), sy = inner * Math.sin(sa);
      const ex = inner * Math.cos(ea), ey = inner * Math.sin(ea);
      const tx = outer * Math.cos(ma), ty = outer * Math.sin(ma);
      const c1x = outer * 0.6 * Math.cos(sa), c1y = outer * 0.6 * Math.sin(sa);
      const c2x = outer * 0.6 * Math.cos(ea), c2y = outer * 0.6 * Math.sin(ea);
      return `M${sx},${sy} Q${c1x},${c1y} ${tx},${ty} Q${c2x},${c2y} ${ex},${ey} Z`;
    }

    // Clip path = union of all petals
    const clipId = "mew-clip";
    const clip = defs.append("clipPath").attr("id", clipId);
    EMOTIONS.forEach((_, i) => {
      clip.append("path").attr("d", petalPath(i, innerR, outerR));
    });

    // ── LAYER 1: White base petals ────────────────────────────────────────────
    EMOTIONS.forEach((_, i) => {
      g.append("path")
        .attr("d", petalPath(i, innerR, outerR))
        .attr("fill", "#ffffff")
        .attr("stroke", "#cccccc")
        .attr("stroke-width", 1);
    });

    // ── LAYER 2: Single movie spider (if movie is provided) ───────────────────
    if (movie) {
      // Compute tip point per emotion
      const pts = EMOTIONS.map((em, i) => {
        const ma    = i * sliceAng - Math.PI / 2 + sliceAng / 2;
        const score = getEmotionScore(movie, em.name);
        const dist  = Math.min(innerR + score * (outerR - innerR - 10) + 8, outerR - 2);
        return { x: dist * Math.cos(ma), y: dist * Math.sin(ma), em };
      });

      const spG = g.append("g").attr("filter", "url(#mew-shadow)");

      // 1. Colored sector fills — clipped inside wheel
      const fillG = spG.append("g").attr("clip-path", `url(#${clipId})`);
      pts.forEach((a, i) => {
        const sa   = i * sliceAng - Math.PI / 2;
        const ea   = sa + sliceAng;
        const dist = Math.sqrt(a.x * a.x + a.y * a.y);
        fillG.append("polygon")
          .attr("points", `0,0 ${dist*Math.cos(sa)},${dist*Math.sin(sa)} ${a.x},${a.y} ${dist*Math.cos(ea)},${dist*Math.sin(ea)}`)
          .attr("fill", a.em.color)
          .attr("fill-opacity", 0.35)
          .attr("stroke", "none");
      });

      // 2. Petal bezier outlines — clipped inside wheel
      const outlineG = spG.append("g").attr("clip-path", `url(#${clipId})`);
      pts.forEach((a, i) => {
        const sa   = i * sliceAng - Math.PI / 2;
        const ea   = sa + sliceAng;
        const ma   = (sa + ea) / 2;
        const dist = Math.sqrt(a.x * a.x + a.y * a.y);
        const sx   = innerR * Math.cos(sa), sy = innerR * Math.sin(sa);
        const ex   = innerR * Math.cos(ea), ey = innerR * Math.sin(ea);
        const tx   = dist * Math.cos(ma),   ty = dist * Math.sin(ma);
        const c1x  = dist * 0.6 * Math.cos(sa), c1y = dist * 0.6 * Math.sin(sa);
        const c2x  = dist * 0.6 * Math.cos(ea), c2y = dist * 0.6 * Math.sin(ea);
        outlineG.append("path")
          .attr("d", `M${sx},${sy} Q${c1x},${c1y} ${tx},${ty} Q${c2x},${c2y} ${ex},${ey} Z`)
          .attr("fill", "none")
          .attr("stroke", a.em.color)
          .attr("stroke-width", 2.0)
          .attr("stroke-opacity", 1.0);
      });

      // 3. Lines connecting all dots — closed spider web
      pts.forEach((a, i) => {
        const b = pts[(i + 1) % pts.length];
        spG.append("line")
          .attr("x1", a.x).attr("y1", a.y)
          .attr("x2", b.x).attr("y2", b.y)
          .attr("stroke", a.em.color)
          .attr("stroke-width", 2.0)
          .attr("stroke-opacity", 1.0)
          .attr("stroke-linecap", "round");
      });

      // 4. Dots at each tip
      pts.forEach((p) => {
        spG.append("circle")
          .attr("cx", p.x).attr("cy", p.y)
          .attr("r", 5)
          .attr("fill", p.em.color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
          .attr("opacity", 1.0);
      });
    }

    // ── LAYER 3: Petal outlines + center + labels on top ─────────────────────
    EMOTIONS.forEach((_, i) => {
      g.append("path")
        .attr("d", petalPath(i, innerR, outerR))
        .attr("fill", "none")
        .attr("stroke", "#bbbbbb")
        .attr("stroke-width", 0.8);
    });

    g.append("circle").attr("r", innerR)
      .attr("fill", "#fff").attr("stroke", "#ccc").attr("stroke-width", 1);

    EMOTIONS.forEach((em, i) => {
      const ma = i * sliceAng - Math.PI / 2 + sliceAng / 2;
      g.append("text")
        .attr("x", labelR * Math.cos(ma))
        .attr("y", labelR * Math.sin(ma))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "11px")
        .style("font-family", "Segoe UI, Arial, sans-serif")
        .style("fill", "#333")
        .text(em.name);
    });
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <svg ref={svgRef} />
    </div>
  );
};

export default MovieEmotionWheel;
