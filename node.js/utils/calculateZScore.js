//חישוב ציון תקן 
function calculateZScore(score, ability, ageGroup) {
    const norms = {
      "זיכרון עבודה": {
        "18-29": { mean: 85, sd: 10 },
        "30-39": { mean: 82, sd: 11 },
        "40-49": { mean: 78, sd: 12 },
        "50-59": { mean: 75, sd: 13 },
        "60-69": { mean: 70, sd: 14 },
        "70-79": { mean: 66, sd: 15 },
        "80+":   { mean: 60, sd: 16 },
      },
      // הוסף שאר היכולות כמו בדוגמה שלך
    };
  
    const norm = norms[ability]?.[ageGroup];
    if (!norm) throw new Error("היכולת או קבוצת הגיל לא נתמכים.");
  
    return (score - norm.mean) / norm.sd;
  }
  
  module.exports = calculateZScore;
  