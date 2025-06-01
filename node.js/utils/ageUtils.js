function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
  
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
  
    return age;
  }
  //לשאול את יעל אם עדיף את הפונקציה שמחזירה מחרוזת או את הפונקציה שמחזירה מספר  
  function getAgeGroup(age) {
    if (age >= 18 && age <= 29) return "18-29";
    if (age >= 30 && age <= 39) return "30-39";
    if (age >= 40 && age <= 49) return "40-49";
    if (age >= 50 && age <= 59) return "50-59";
    if (age >= 60 && age <= 69) return "60-69";
    if (age >= 70 && age <= 79) return "70-79";
    if (age >= 80) return "80+";
    throw new Error("גיל מחוץ לטווח הנתמך (מ-18 ומעלה)");
  }

  function getAgeGroupNumber(age) {
    if (age >= 18 && age <= 29) return 1; // "18-29"
    if (age >= 30 && age <= 39) return 2; // "30-39"
    if (age >= 40 && age <= 49) return 3; // "40-49"
    if (age >= 50 && age <= 59) return 4; // "50-59"
    if (age >= 60 && age <= 69) return 5; // "60-69"
    if (age >= 70 && age <= 79) return 6; // "70-79"
    if (age >= 80) return 7; // "80+"
    throw new Error("גיל מחוץ לטווח הנתמך (מ-18 ומעלה)");
  }
  module.exports = { calculateAge, getAgeGroup };
  