import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";

interface Props {
  data: { name: string; score: number }[];
}

const ScoreRadarChart: React.FC<Props> = ({ data }) => {
 return(<>
    <h3 className="text-xl font-semibold text-center text-gray-700 mb-2">
      גרף מכ"ם - Radar
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <Tooltip formatter={(value: number, name: string) => [`${value}`, "ציון"]} />
        <PolarGrid />
         <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar name="Score" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
</>)};

export default ScoreRadarChart;

