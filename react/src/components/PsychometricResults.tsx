// src/components/PsychometricResults.tsx
import React from "react";
import { motion } from "framer-motion";
import IconMap from "../utils/IconMap";
import type { ResultsData } from "../types/resultsTypes";
import ScoreBarChart from "./charts/ScoreBarChart";
import ScoreRadarChart from "./charts/ScoreRadarChart";
import ScoreLineChart from "./charts/ScoreLineChart";
import { Card, CardContent } from "./ui/Card";

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

  const scoreData = chartData.map(({ subject, score }) => ({
    name: subject,
    score,
  }));

  return (
    <div className="p-6 space-y-10 animate-fade-in" dir="rtl">
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-4">
        תוצאות פסיכוטכניות
      </h2>

      {/* Radar Chart */}
      <Card>
        <ScoreRadarChart data={scoreData} />
      </Card>

      {/* Bar Chart */}
      <Card>
        <ScoreBarChart data={scoreData} average={AVERAGE_SCORE} />
      </Card>

      {/* Line Chart */}
      <Card>
        <ScoreLineChart data={scoreData} average={AVERAGE_SCORE} />
      </Card>

      {/* פירוט יכולות + המלצות */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {abilityKeys.map((key, idx) => {
          const ability = data.psychometricResults[key];
          const recommendation = data.recommendations?.[idx];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <div className="flex items-center space-x-4 mb-3 flex-row-reverse">
                  <div className="p-2 bg-gray-100 rounded-full">{IconMap[key]}</div>
                  <h4 className="text-lg font-semibold text-gray-800">{labels[key]}</h4>
                </div>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-1">
                    ציון שלך: <span className="font-bold text-indigo-600">{ability.score}</span>
                  </p>
                  <p className="text-sm text-gray-600">{ability.description}</p>
                  {recommendation && (
                    <p className="mt-2 text-sm text-emerald-600 font-medium">
                      {recommendation}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ממוצע ארצי */}
      <Card className="mt-6 bg-gray-50">
        <CardContent>
          <h3 className="text-md font-bold text-gray-700 mb-2">ממוצע ארצי: {AVERAGE_SCORE}</h3>
          <p className="text-sm text-gray-600">
            הציון שלך גבוה מהממוצע הארצי. מומלץ לשקול תחומים אנליטיים או טכנולוגיים, בהתאם ליכולות הבולטות שלך.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PsychometricResults;
