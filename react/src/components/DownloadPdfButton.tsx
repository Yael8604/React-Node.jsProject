import React from "react";
import html2pdf from "html2pdf.js";

export const DownloadPdfButton: React.FC = () => {
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
    <button
      onClick={handleDownloadPDF}
      aria-label="הורד את התוצאות כקובץ PDF"
      className="bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-indigo-700 transition"
    >
      הורד תוצאות כ־PDF
    </button>
  );
};