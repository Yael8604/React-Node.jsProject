import React from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, ReferenceLine
} from "recharts";
import { motion } from "framer-motion";
import IconMap from "../utils/IconMap";
import type { ResultsData } from "../types/resultsTypes";

interface PsychometricResultsProps {
  data: ResultsData;
}

const labels: Record<string, string> = {
  technicalAbility: "יכולת טכנית",
  logicalReasoning: "חשיבה לוגית",
  spatialReasoning: "חשיבה מרחבית",
  quantitativeReasoning: "חשיבה כמותית",
  verbalReasoning: "חשיבה מילולית",
};

const abilityKeys = [
  "technicalAbility",
  "logicalReasoning",
  "spatialReasoning",
  "quantitativeReasoning",
  "verbalReasoning",
] as const;

const AVERAGE_SCORE = 72;

const PsychometricResults: React.FC<PsychometricResultsProps> = ({ data }) => {
  const chartData = abilityKeys.map((key) => ({
    subject: labels[key],
    score: data.psychometricResults[key].score,
  }));

  return (
    <div className="p-6 space-y-10 animate-fade-in" dir="rtl">
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-4">
        תוצאות פסיכוטכניות
      </h2>

      {/* Radar Chart */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-4">
        <h3 className="text-xl font-semibold text-center text-gray-700 mb-2">
          גרף מכ"ם (Radar)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#4B5563", fontSize: 12 }} />
            <Radar name="ציון" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-4">
        <h3 className="text-xl font-semibold text-center text-gray-700 mb-2">
          השוואת ציונים (Bar Chart)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#4B5563" }} />
            <YAxis type="category" dataKey="subject" tick={{ fill: "#4B5563", fontSize: 12 }} width={120} />
            <Tooltip formatter={(value) => [`${value}`, "ציון"]} />
            <Bar dataKey="score" fill="#4F46E5" radius={[0, 6, 6, 0]} />
            <ReferenceLine x={AVERAGE_SCORE} stroke="#EF4444" strokeDasharray="4 4" label={{ value: "ממוצע ארצי", position: "insideTopRight", fill: "#EF4444", fontSize: 12 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-2xl shadow border border-indigo-100 p-4">
        <h3 className="text-xl font-semibold text-center text-gray-700 mb-2">
          גרף מגמה חלקה (Line Chart)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" tick={{ fill: "#4B5563", fontSize: 12 }} />
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
            <ReferenceLine y={AVERAGE_SCORE} stroke="#EF4444" strokeDasharray="4 4" label={{ value: "ממוצע ארצי", position: "top", fill: "#EF4444", fontSize: 12 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* פירוט יכולות + המלצות */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {abilityKeys.map((key, idx) => {
          const ability = data.psychometricResults[key];
          const recommendation = data.recommendations?.[idx];
          return (
            <motion.div
              key={key}
              className="p-4 bg-white rounded-2xl shadow-md border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center space-x-4 mb-3 flex-row-reverse">
                <div className="p-2 bg-gray-100 rounded-full">{IconMap[key]}</div>
                <h4 className="text-lg font-semibold text-gray-800">{labels[key]}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                ציון שלך: <span className="font-bold text-indigo-600">{ability.score}</span>
              </p>
              <p className="text-sm text-gray-600">{ability.description}</p>
              {recommendation && (
                <p className="mt-2 text-sm text-emerald-600 font-medium">
                  {recommendation}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ממוצע והמלצה כללית */}
      <div className="mt-6 p-4 bg-gray-50 border rounded-xl">
        <h3 className="text-md font-bold text-gray-700 mb-2">ממוצע ארצי: {AVERAGE_SCORE}</h3>
        <p className="text-sm text-gray-600">
          הציון שלך גבוה מהממוצע הארצי. מומלץ לשקול תחומים אנליטיים או טכנולוגיים, בהתאם ליכולות הבולטות שלך.
        </p>
      </div>
    </div>
  );
};

export default PsychometricResults;
// import React from "react";
// import GraphSwitcher from "./GraphSwitcher";
// import IconMap from "../utils/IconMap";
// import type { ResultsData } from "../types/resultsTypes";
// import { motion } from "framer-motion";

// interface PsychometricResultsProps {
//   data: ResultsData;
// }

// const labels: Record<string, string> = {
//   technicalAbility: "יכולת טכנית",
//   logicalReasoning: "חשיבה לוגית",
//   spatialReasoning: "חשיבה מרחבית",
//   quantitativeReasoning: "חשיבה כמותית",
//   verbalReasoning: "חשיבה מילולית",
// };

// const abilityKeys = [
//   "technicalAbility",
//   "logicalReasoning",
//   "spatialReasoning",
//   "quantitativeReasoning",
//   "verbalReasoning",
// ] as const;

// const AVERAGE_SCORE = 72;

// const PsychometricResults: React.FC<PsychometricResultsProps> = ({ data }) => {
//   return (
//     <div className="p-6 space-y-10 animate-fade-in" dir="rtl">
//       {/* כותרת */}
//       <h2 className="text-3xl font-bold text-center text-indigo-700 mb-4">
//         תוצאות פסיכוטכניות
//       </h2>

//       {/* גרפים דינמיים עם מעבר חלק */}
//       <GraphSwitcher data={data.psychometricResults} />

//       {/* פירוט יכולות + הסברים והמלצות */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {abilityKeys.map((key, idx) => {
//           const ability = data.psychometricResults[key];
//           const recommendation = data.recommendations?.[idx];

//           return (
//             <motion.div
//               key={key}
//               className="p-4 bg-white rounded-2xl shadow-md border border-gray-200"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: idx * 0.1 }}
//             >
//               {/* כותרת קטגוריה עם אייקון */}
//               <div className="flex items-center space-x-4 mb-3 flex-row-reverse">
//                 <div className="p-2 bg-gray-100 rounded-full">
//                   {IconMap[key]}
//                 </div>
//                 <h4 className="text-lg font-semibold text-gray-800">
//                   {labels[key]}
//                 </h4>
//               </div>

//               {/* הציון והתיאור */}
//               <p className="text-sm text-gray-600 mb-1">
//                 ציון שלך:{" "}
//                 <span className="font-bold text-indigo-600">
//                   {ability.score}
//                 </span>
//               </p>
//               <p className="text-sm text-gray-600">{ability.description}</p>

//               {/* המלצה אם קיימת */}
//               {recommendation && (
//                 <p className="mt-2 text-sm text-emerald-600 font-medium">
//                   {recommendation}
//                 </p>
//               )}
//             </motion.div>
//           );
//         })}
//       </div>

//       {/* ממוצע והמלצה כללית */}
//       <div className="mt-6 p-4 bg-gray-50 border rounded-xl">
//         <h3 className="text-md font-bold text-gray-700 mb-2">ממוצע ארצי: {AVERAGE_SCORE}</h3>
//         <p className="text-sm text-gray-600">
//           הציון שלך גבוה מהממוצע הארצי. מומלץ לשקול תחומים אנליטיים או טכנולוגיים, בהתאם ליכולות הבולטות שלך.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default PsychometricResults;


