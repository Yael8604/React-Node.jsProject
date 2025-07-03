import React from "react";
import { CartesianGrid, LineChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis,Line,Tooltip } from "recharts";

interface Props {
    data: { name: string; score: number }[];
    average: number;
}

const ScoreLineChart: React.FC<Props> = ({ data , average }) => {
    return (<>
            <h3 className="text-xl font-semibold text-center text-gray-700 mb-2">
                גרף מגמה חלקה - Line Chart 
            </h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity={0.2} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: "#4B5563", fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#4B5563" }} />
                    <Tooltip formatter={(value) => [`${value}`, "ציון"]} />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#6366F1"
                        strokeWidth={3}
                        dot={{ r: 5, stroke: "#6366F1", strokeWidth: 2, fill: "#fff" }}
                        activeDot={{ r: 8 }}
                        fill="url(#lineGradient)"
                    />
                    <ReferenceLine y={average} stroke="#EF4444" strokeDasharray="4 4" label={{ value: "ממוצע ארצי", position: "top", fill: "#EF4444", fontSize: 12 }} />
                </LineChart>
            </ResponsiveContainer>

    </>)
};

export default ScoreLineChart
