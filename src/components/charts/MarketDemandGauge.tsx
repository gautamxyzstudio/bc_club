import React, { useEffect, useState } from "react";

export type MarketConditionType =
  | "Buyer's Market"
  | "Balanced"
  | "Seller's Market";

export const getMarketCondition = (sal: number): MarketConditionType => {
  if (sal < 12) return "Buyer's Market";
  if (sal <= 20) return "Balanced";
  return "Seller's Market";
};

type MarketDemandGaugeProps = {
  value: number;
  max?: number;
  showLabels?: boolean;
};

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const rad = (angle * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const describeArc = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
};

const MarketDemandGauge: React.FC<MarketDemandGaugeProps> = ({
  value,
  max = 32,
  showLabels = true,
}) => {
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;
  const clampedValue = Math.max(0, Math.min(max, safeValue));
  const targetAngle = (clampedValue / max) * 180 - 90;

  const [angle, setAngle] = useState(-90);

  // Animate needle sweep
  useEffect(() => {
    requestAnimationFrame(() => setAngle(targetAngle));
  }, [targetAngle]);

  const getColor = () => {
    if (clampedValue < 12) return "#F5A900"; // yellow - Buyer's Market (SAL < 12%)
    if (clampedValue <= 20) return "#34a853"; // green - Balanced Market (SAL 12-20%)
    return "#ea4335"; // red - Seller's Market (SAL > 20%)
  };

  const needleColor = getColor();

  // Tick marks: 0, 4, 8, 12, 16, 20, 24, 28, 32
  const ticks = [0, 4, 8, 12, 16, 20, 24, 28, 32];
  const cx = 100;
  const cy = 100;
  const r = 70;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 320,
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <svg viewBox="0 0 200 120" width="100%">
        {/* Gauge arcs */}
        {/* Buyer's Market (Yellow): SAL < 12% (-180° → -112.5°) */}
        <path
          d={describeArc(cx, cy, r, -180, -112.5)}
          stroke="#F5A900"
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
        />

        {/* Balanced Market (Green): SAL 12-20% (-112.5° → -67.5°) */}
        <path
          d={describeArc(cx, cy, r, -112.5, -67.5)}
          stroke="#34a853"
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
        />

        {/* Seller's Market (Red): SAL > 20% (-67.5° → 0°) */}
        <path
          d={describeArc(cx, cy, r, -67.5, 0)}
          stroke="#ea4335"
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {ticks.map((tick, i) => {
          const tickAngle = -180 + (tick / max) * 180;
          const isThreshold = tick === 12 || tick === 20;
          const r1 = 58;
          const x1 = cx + r1 * Math.cos((tickAngle * Math.PI) / 180);
          const y1 = cy + r1 * Math.sin((tickAngle * Math.PI) / 180);

          return (
            <circle
              key={i}
              cx={x1}
              cy={y1}
              r={isThreshold ? 2 : 1.5}
              fill={isThreshold ? "#666" : "#aaa"}
            />
          );
        })}

        {/* Threshold & Scale Labels */}
        {showLabels && (
          <>
            <text
              x="24"
              y="114"
              fill="#8e8e93"
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
            >
              0%
            </text>
            <text
              x="68"
              y="18"
              fill="#8e8e93"
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
            >
              12%
            </text>
            <text
              x="132"
              y="18"
              fill="#8e8e93"
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
            >
              20%
            </text>
            <text
              x="176"
              y="114"
              fill="#8e8e93"
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
            >
              32%
            </text>
          </>
        )}

        {/* Needle */}
        <path
          d="M96 100 L104 100 L101 52 L99 52 Z"
          fill={needleColor}
          style={{
            transformOrigin: "100px 100px",
            transform: `rotate(${angle}deg)`,
            transition: "transform 1s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />

        {/* Center circles */}
        <circle cx={100} cy={100} r={8} fill={needleColor} />
        <circle cx={100} cy={100} r={3} fill="#ffffff" />
      </svg>
    </div>
  );
};

export default MarketDemandGauge;
