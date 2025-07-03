import { ResultsData } from "../types/resultsTypes";

export const fetchResults = async (): Promise<ResultsData> => {
  const res = await fetch("http://localhost:3000/api/results", {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData?.error || "שגיאה בטעינת התוצאות");
  }

  return res.json();
};