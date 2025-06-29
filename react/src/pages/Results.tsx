import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import html2pdf from "html2pdf.js";

import PsychometricResults from "../components/PsychometricResults";
import PersonalityResults from "../components/PersonalityResults";
import Recommendations from "../components/Recommendations";

import { ResultsData } from "../types/resultsTypes";
import { Spinner } from "../components/ui/Spinner";
import { ErrorCard } from "../components/ui/ErrorCard";


const fetchResults = async (): Promise<ResultsData> => {
  const res = await fetch("http://localhost:3000/api/results", {
    credentials: "include", // חשוב לשליחת cookies
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData?.error || "שגיאה בטעינת התוצאות");
  }

  return res.json();
};

interface ResultsProps {
  results?: ResultsData;
}

const Results: React.FC<ResultsProps> = () => {

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["results"],
    queryFn: fetchResults,
    refetchOnWindowFocus: false,
  });
  if (isLoading) return <Spinner message="טוען את תוצאות הבחינה..." />;
  if (isError || !data) return <ErrorCard error={error || new Error("לא נמצאו נתונים להצגה")} />;


  const handleDownloadPDF = () => {
    const element = document.getElementById("results-to-export");
    if (element) {
      html2pdf()
        .set({
          margin: 0.5,
          filename: "psychometric_results.pdf",
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(element)
        .save();
    }
  };

  return (
    <motion.div
      dir="rtl"
      className="results-page-container max-w-4xl mx-auto p-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-600">תוצאות הבחינה שלך</h1>
        <button
          onClick={handleDownloadPDF}
          aria-label="הורד את התוצאות כקובץ PDF"
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-indigo-700 transition"
        >
          הורד תוצאות כ־PDF
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        להלן ניתוח מפורט של יכולותיך ופרופיל האישיות שלך.
      </p>

      <div id="results-to-export" className="space-y-8">
        <motion.div
          className="results-section"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PsychometricResults data={data!} />
        </motion.div>

        {/* <motion.div
          className="results-section"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PersonalityResults data={data!.personalityResults} />
        </motion.div> */}

        <motion.div
          className="results-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Recommendations data={data!.recommendations} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Results;
