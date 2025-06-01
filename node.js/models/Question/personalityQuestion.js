// personalityQuestion.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const baseQuestionSchema = require('./baseQuestion').schema; // קבלת הסכמה הבסיסית

const personalityQuestionSchema = new Schema({
  ...baseQuestionSchema.obj, // הוספת השדות מהסכמה הבסיסית
  scale: { type: String },//הממד האישיותי שהשאלה נועדה למדוד (מוחצנות, נעימות וכו')
  answerOptions: { type: [String] }, //סולם התגובה (למשל, סולם ליקרט).
  scoringDirection: { type: String, enum: ['positive', 'negative'] }//האם הסכמה עם ההיגד מעידה על רמה גבוהה או נמוכה בממד הנמדד.
});

const PersonalityQuestion = mongoose.model('PersonalityQuestion', personalityQuestionSchema,'personality_questions');
module.exports = PersonalityQuestion;


// // src/models/PersonalityQuestion.js
// const mongoose = require('mongoose');

// const personalityQuestionSchema = new mongoose.Schema({
//     questionText: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     // עבור שאלות אישיותיות, התשובות הן לרוב סקאלה (לדוגמה, "בכלל לא מסכים" עד "מסכים מאוד")
//     scale: { // שם הסקאלה או המימד שהשאלה בודקת (לדוגמה: "פתיחות", "מוחצנות")
//         type: String,
//         required: true,
//         enum: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] // דוגמה
//     },
//     direction: { // האם ציון גבוה בתשובה מצביע על ציון גבוה בסקאלה או נמוך
//         type: Number, // 1 for positive, -1 for negative
//         default: 1
//     },
//     // אפשרויות התשובה אם הן מוגדרות מראש (לדוגמה, Likert scale)
//     options: [{ // לדוגמה: ['בכלל לא מסכים', 'לא מסכים', 'נייטרלי', 'מסכים', 'מסכים מאוד']
//         type: String,
//         required: true
//     }],
//     // אלו הפרמטרים של IRT אם תרצה ליישם מודל כזה בעתיד
//     // במקרה של אישיות, IRT משמש להערכת רמת התכונה של הנבדק
//     irt_a: { // Discrimination (הבחנה)
//         type: Number,
//         default: 1.0
//     },
//     irt_b: { // Difficulty (קושי / מיקום על הסקאלה)
//         type: Number,
//         default: 0.0
//     },
//     // שאלות אישיות לרוב לא כוללות ניחוש
//     // irt_c: { type: Number, default: 0.0 }, 
    
//     // Other fields you might have
// }, { timestamps: true });

// module.exports = mongoose.model('PersonalityQuestion', personalityQuestionSchema);