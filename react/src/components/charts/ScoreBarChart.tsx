// src/components/charts/ScoreBarChart.tsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface Props {
  data: { name: string; score: number }[];
  average: number;
}

const ScoreBarChart: React.FC<Props> = ({ data, average }) => {
  return (
    <>
      <h3 className="text-xl font-semibold text-center text-gray-700 mb-2">
        השוואת ציונים - Bar Chart
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 40, left: 80, bottom: 10 }}
          barCategoryGap="20%"
          barGap={6}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "#4B5563", fontSize: 12 }}
            tickCount={6}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{
              fill: "#4B5563",
              fontSize: 14,
              textAnchor: "end",
              style: { direction: "rtl", whiteSpace: "nowrap" }
            }}
            width={180}
            interval={0}
          />
          <Tooltip formatter={(value) => [`${value}`, "ציון"]} />
          <Bar dataKey="score" fill="#4F46E5" radius={[0, 6, 6, 0]} />
          <ReferenceLine
            x={average}
            stroke="#EF4444"
            strokeDasharray="4 4"
            label={{
              value: "ממוצע ארצי",
              position: "insideTopRight",
              fill: "#EF4444",
              fontSize: 12,
            }}
          />
        </BarChart>
      </ResponsiveContainer>

    </>
  );
};

export default ScoreBarChart;
