import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from "recharts";

interface Props {
  data: { name: string; score: number }[];
}

const ScoreRadarChart: React.FC<Props> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RadarChart data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey="name" />
      <PolarRadiusAxis angle={30} domain={[0, 100]} />
      <Radar name="Score" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
    </RadarChart>
  </ResponsiveContainer>
);

export default ScoreRadarChart;

