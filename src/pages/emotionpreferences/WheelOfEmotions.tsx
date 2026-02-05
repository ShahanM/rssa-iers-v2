import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface EmotionDataItem {
  emotion: string;
  value: number;
  color: string;
}

interface WheelOfEmotionsProps {
  data: EmotionDataItem[];
  size?: number;
  variant?: 'straight' | 'inverse' | 'rounded' | 'scaled';
}

const WheelOfEmotions: React.FC<WheelOfEmotionsProps> = ({ data, size, variant = 'scaled' }) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (data && data.length > 0) {
      drawChart();
    }
  }, [data, size, variant]);

  const drawChart = () => {
    const width = size || 200;
    const height = size || 200;
    const padding = 50;

    d3.select(ref.current).selectAll('*').remove();

    const svg = d3.select(ref.current)
      .attr('width', width + padding * 2)
      .attr('height', height + padding * 2)
      .append('g')
      .attr('transform', `translate(${(width + padding * 2) / 2}, ${(height + padding * 2) / 2})`);

    const radius = Math.min(width, height) / 2;
    const labelRadius = radius * 1.19;
    const fixedInnerRadius = radius * 0.09;
    const fixedOuterRadius = radius;

    const pie = d3.pie<EmotionDataItem>().value(() => 1); // Equal size for all slices

    let pathFunction: (d: d3.PieArcDatum<EmotionDataItem>, innerRadius: number, outerRadius: number, value: number) => string;
    switch (variant) {
      case 'straight':
        pathFunction = createProgressFilledPetalPathStraight;
        break;
      case 'inverse':
        pathFunction = createProgressFilledPetalPathInverse;
        break;
      case 'rounded':
        pathFunction = createProgressFilledPetalPathRounded;
        break;
      case 'scaled':
      default:
        pathFunction = createProgressFilledPetalPathScaled;
        break;
    }

    // Draw the white petals (background)
    svg.selectAll('.petal-bg')
      .data(pie(data))
      .enter().append('path')
      .attr('class', 'petal-bg')
      .attr('d', d => createFixedPetalPath(d, fixedInnerRadius, fixedOuterRadius))
      .attr('fill', '#fff') // White background for all petals
      .attr('stroke', '#ccc')
      .attr('stroke-width', '1px');

    // Define clip paths based on the emotion value to progressively fill the petals from the base
    svg.selectAll('.clip-path')
      .data(pie(data))
      .enter().append('clipPath')
      .attr('id', (d, i) => `clip-${i}`)
      .append('path')
      .attr('d', d => pathFunction(d, fixedInnerRadius, fixedOuterRadius, d.data.value));

    // Draw the color-filled part based on the emotion value using the clipping paths
    svg.selectAll('.petal-fill')
      .data(pie(data))
      .enter().append('path')
      .attr('class', 'petal-fill')
      .attr('d', d => createFixedPetalPath(d, fixedInnerRadius, fixedOuterRadius)) // Use the full petal path
      .attr('fill', d => d.data.color) // Apply solid color
      .attr('clip-path', (d, i) => `url(#clip-${i})`) // Use clip-path to control the fill amount
      .attr('stroke', 'none'); // No stroke for the filled part

    // Add emotion labels
    svg.selectAll('.label')
      .data(pie(data))
      .enter().append('text')
      .attr('class', 'label')
      .attr('transform', d => {
        const angle = (d.startAngle + d.endAngle) / 2;
        const x = Math.cos(angle - Math.PI / 2) * labelRadius;
        const y = Math.sin(angle - Math.PI / 2) * labelRadius;
        const rotate = (angle > Math.PI / 2 && angle < (3 * Math.PI) / 2) ? angle * 180 / Math.PI + 180 : angle * 180 / Math.PI;
        return `translate(${x}, ${y}) rotate(${rotate})`;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('alignment-baseline', 'middle')
      .text(d => d.data.emotion);
  };

  const createFixedPetalPath = (d: d3.PieArcDatum<EmotionDataItem>, innerRadius: number, outerRadius: number): string => {
    const startAngle = d.startAngle - Math.PI / 2;
    const endAngle = d.endAngle - Math.PI / 2;
    const midAngle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;

    const sx = innerRadius * Math.cos(startAngle);
    const sy = innerRadius * Math.sin(startAngle);

    const ex = innerRadius * Math.cos(endAngle);
    const ey = innerRadius * Math.sin(endAngle);

    const tipX = outerRadius * Math.cos(midAngle);
    const tipY = outerRadius * Math.sin(midAngle);

    const controlPoint1X = outerRadius * 0.6 * Math.cos(startAngle);
    const controlPoint1Y = outerRadius * 0.6 * Math.sin(startAngle);

    const controlPoint2X = outerRadius * 0.6 * Math.cos(endAngle);
    const controlPoint2Y = outerRadius * 0.6 * Math.sin(endAngle);

    return `
      M ${sx},${sy} 
      Q ${controlPoint1X},${controlPoint1Y} ${tipX},${tipY} 
      Q ${controlPoint2X},${controlPoint2Y} ${ex},${ey} 
      Z`;
  };

  const createProgressFilledPetalPathStraight = (d: d3.PieArcDatum<EmotionDataItem>, innerRadius: number, outerRadius: number, value: number): string => {
    const fillOuterRadius = innerRadius + (outerRadius - innerRadius) * value;

    const startAngle = d.startAngle - Math.PI / 2;
    const endAngle = d.endAngle - Math.PI / 2;

    const sx = innerRadius * Math.cos(startAngle);
    const sy = innerRadius * Math.sin(startAngle);

    const ex = innerRadius * Math.cos(endAngle);
    const ey = innerRadius * Math.sin(endAngle);

    const tipStartX = fillOuterRadius * Math.cos(startAngle);
    const tipStartY = fillOuterRadius * Math.sin(startAngle);

    const tipEndX = fillOuterRadius * Math.cos(endAngle);
    const tipEndY = fillOuterRadius * Math.sin(endAngle);

    // Create the path with a straight line at the tip
    const filledPath = `
    M ${sx},${sy} 
    L ${tipStartX},${tipStartY} 
    L ${tipEndX},${tipEndY}
    L ${ex},${ey} 
    Z
  `;

    return filledPath;
  };

  const createProgressFilledPetalPathInverse = (d: d3.PieArcDatum<EmotionDataItem>, innerRadius: number, outerRadius: number, value: number): string => {
    const fillInnerRadius = outerRadius - (outerRadius - innerRadius) * value;

    const startAngle = d.startAngle - Math.PI / 2;
    const endAngle = d.endAngle - Math.PI / 2;
    const midAngle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;
    const sx = outerRadius * Math.cos(startAngle);
    const sy = outerRadius * Math.sin(startAngle);

    const ex = outerRadius * Math.cos(endAngle);
    const ey = outerRadius * Math.sin(endAngle);

    const tipX = outerRadius * Math.cos(midAngle);
    const tipY = outerRadius * Math.sin(midAngle);

    const baseStartX = fillInnerRadius * Math.cos(startAngle);
    const baseStartY = fillInnerRadius * Math.sin(startAngle);

    const baseEndX = fillInnerRadius * Math.cos(endAngle);
    const baseEndY = fillInnerRadius * Math.sin(endAngle);

    const filledPath = `
    M ${sx},${sy} 
    L ${tipX},${tipY} 
    L ${ex},${ey} 
    L ${baseEndX},${baseEndY}
    L ${baseStartX},${baseStartY} 
    Z
  `;

    return filledPath;
  };

  const createProgressFilledPetalPathRounded = (d: d3.PieArcDatum<EmotionDataItem>, innerRadius: number, outerRadius: number, value: number): string => {
    const fillOuterRadius = innerRadius + (outerRadius - innerRadius) * value;

    const startAngle = d.startAngle - Math.PI / 2;
    const endAngle = d.endAngle - Math.PI / 2;
    const midAngle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;

    const sx = innerRadius * Math.cos(startAngle);
    const sy = innerRadius * Math.sin(startAngle);

    const ex = innerRadius * Math.cos(endAngle);
    const ey = innerRadius * Math.sin(endAngle);

    const tipX = fillOuterRadius * Math.cos(midAngle);
    const tipY = fillOuterRadius * Math.sin(midAngle);

    const controlPoint1X = fillOuterRadius * 0.6 * Math.cos(startAngle);
    const controlPoint1Y = fillOuterRadius * 0.6 * Math.sin(startAngle);

    const controlPoint2X = fillOuterRadius * 0.6 * Math.cos(endAngle);
    const controlPoint2Y = fillOuterRadius * 0.6 * Math.sin(endAngle);

    const roundedTipRadius = 10;
    const roundedTipArc = `A ${roundedTipRadius},${roundedTipRadius} 0 0,1 ${tipX},${tipY}`;

    const roundedTipPath = `
      M ${sx},${sy}
      Q ${controlPoint1X},${controlPoint1Y} ${tipX},${tipY}
      ${roundedTipArc}
      Q ${controlPoint2X},${controlPoint2Y} ${ex},${ey}
      Z
    `;

    return roundedTipPath;
  };

  const createProgressFilledPetalPathScaled = (d: d3.PieArcDatum<EmotionDataItem>, innerRadius: number, outerRadius: number, value: number): string => {

    const scaledOuterRadius = innerRadius + (outerRadius - innerRadius) * value * 2;

    const startAngle = d.startAngle - Math.PI / 2;
    const endAngle = d.endAngle - Math.PI / 2;
    const midAngle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;

    const sx = innerRadius * Math.cos(startAngle);
    const sy = innerRadius * Math.sin(startAngle);

    const ex = innerRadius * Math.cos(endAngle);
    const ey = innerRadius * Math.sin(endAngle);

    const tipX = scaledOuterRadius * Math.cos(midAngle);
    const tipY = scaledOuterRadius * Math.sin(midAngle);

    const controlPoint1X = scaledOuterRadius * 0.6 * Math.cos(startAngle);
    const controlPoint1Y = scaledOuterRadius * 0.6 * Math.sin(startAngle);
    const controlPoint2X = scaledOuterRadius * 0.6 * Math.cos(endAngle);
    const controlPoint2Y = scaledOuterRadius * 0.6 * Math.sin(endAngle);

    return `
    M ${sx},${sy} 
    Q ${controlPoint1X},${controlPoint1Y} ${tipX},${tipY}
    Q ${controlPoint2X},${controlPoint2Y} ${ex},${ey}
    Z
  `;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg ref={ref}></svg>
    </div>
  );
};

export default WheelOfEmotions;
