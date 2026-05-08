import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { EmotionStatusValue } from "./EmotionPreferences";

interface MiniPreferenceWheelProps {
  emotionMap: Map<string, EmotionStatusValue>;
  size?: number;
}

const EMOTIONS = ["Joy","Trust","Fear","Surprise","Sadness","Disgust","Anger","Anticipation"];

// Official PyPlutchik colors — Trust and Fear now clearly distinct
const EMO_RGB: Record<string, [number,number,number]> = {
  Joy:          [255, 215,   0],  // gold
  Trust:        [107, 142,  35],  // olivedrab
  Fear:         [ 34, 139,  34],  // forestgreen
  Surprise:     [135, 206, 235],  // skyblue
  Sadness:      [ 30, 144, 255],  // dodgerblue
  Disgust:      [106,  90, 205],  // slateblue
  Anger:        [255,  69,   0],  // orangered
  Anticipation: [255, 140,   0],  // darkorange
};

export function drawWheel(
  svgEl: SVGSVGElement,
  size: number,
  getState: (emo: string) => "high" | "low" | "diversify",
  labelSize: number = 9
) {
  const labelPad = labelSize * 3.5;
  const total = size + labelPad * 2;
  const cx = total / 2, cy = total / 2;
  const outerR = size / 2, innerR = outerR * 0.09;
  const labelR = outerR + labelSize * 1.4;
  const sliceAngle = (2 * Math.PI) / EMOTIONS.length;

  const root = d3.select(svgEl);
  root.selectAll("*").remove();
  root.attr("width", total).attr("height", total);
  const defs = root.append("defs");

  const petal = (iR: number, oR: number, sa: number, ea: number, ma: number) => {
    const sx = cx+iR*Math.cos(sa), sy = cy+iR*Math.sin(sa);
    const ex = cx+iR*Math.cos(ea), ey = cy+iR*Math.sin(ea);
    const tx = cx+oR*Math.cos(ma), ty = cy+oR*Math.sin(ma);
    const c1x = cx+oR*0.6*Math.cos(sa), c1y = cy+oR*0.6*Math.sin(sa);
    const c2x = cx+oR*0.6*Math.cos(ea), c2y = cy+oR*0.6*Math.sin(ea);
    return `M${sx},${sy} Q${c1x},${c1y} ${tx},${ty} Q${c2x},${c2y} ${ex},${ey} Z`;
  };

  EMOTIONS.forEach((emo, i) => {
    const sa = i * sliceAngle - Math.PI / 2;
    const ea = sa + sliceAngle;
    const ma = (sa + ea) / 2;
    const [r, g, b] = EMO_RGB[emo] || [170, 170, 170];
    const state = getState(emo);

    // White background petal
    root.append("path")
      .attr("d", petal(innerR, outerR, sa, ea, ma))
      .attr("fill", "#ffffff")
      .attr("stroke", "#cccccc")
      .attr("stroke-width", 0.8);

    if (state === "high") {
      // Full petal — dark solid
      root.append("path")
        .attr("d", petal(innerR, outerR, sa, ea, ma))
        .attr("fill", `rgb(${r},${g},${b})`)
        .attr("opacity", 0.90);

    } else if (state === "low") {
      // Small 45% petal — light/faded
      const sR = innerR + (outerR - innerR) * 0.45;
      root.append("path")
        .attr("d", petal(innerR, sR, sa, ea, ma))
        .attr("fill", `rgb(${r},${g},${b})`)
        .attr("opacity", 0.30);

    } else {
      // DIVERSIFY — linear gradient dark (base) → light (tip)
      // Uses actual SVG coordinates so direction is always correct per petal
      const gid = `lg-${i}-${Math.random().toString(36).slice(2)}`;
      const grad = defs.append("linearGradient")
        .attr("id", gid)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", cx + innerR * Math.cos(ma))
        .attr("y1", cy + innerR * Math.sin(ma))
        .attr("x2", cx + outerR * Math.cos(ma))
        .attr("y2", cy + outerR * Math.sin(ma));

      grad.append("stop").attr("offset", "0%")
        .attr("stop-color", `rgb(${r},${g},${b})`).attr("stop-opacity", 0.90);
      grad.append("stop").attr("offset", "55%")
        .attr("stop-color", `rgb(${r},${g},${b})`).attr("stop-opacity", 0.45);
      grad.append("stop").attr("offset", "100%")
        .attr("stop-color", `rgb(${r},${g},${b})`).attr("stop-opacity", 0.08);

      root.append("path")
        .attr("d", petal(innerR, outerR, sa, ea, ma))
        .attr("fill", `url(#${gid})`);
    }

    // Label
    root.append("text")
      .attr("x", cx + labelR * Math.cos(ma))
      .attr("y", cy + labelR * Math.sin(ma))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", `${labelSize}px`)
      .style("fill", "#444")
      .text(emo);
  });
}

const MiniPreferenceWheel: React.FC<MiniPreferenceWheelProps> = ({ emotionMap, size = 180 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    drawWheel(svgRef.current, size, (emo) => {
      const v = (emotionMap?.get(emo) || "ignore").toLowerCase();
      if (v === "high") return "high";
      if (v === "low")  return "low";
      return "diversify";
    }, 9);
  }, [emotionMap, size]);

  return <div style={{ display:"flex", justifyContent:"center" }}><svg ref={svgRef}/></div>;
};

export default MiniPreferenceWheel;
