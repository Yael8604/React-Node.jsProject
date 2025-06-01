// models/testSession.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testSessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  testType: { type: String, enum: ['psychotechnical', 'personality'], required: true }, 

  startedAt: { type: Date, default: Date.now },

  endedAt: { type: Date },

  PsychotechnicalQuestionid: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PsychotechnicalQuestion' }],

  PersonalityQuestionids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PersonalityQuestion' }],

  answers: [{ type: Schema.Types.ObjectId, ref: 'userAnswer' }], // קישור לכל התשובות שנשמרו

  summary: {
    // התוצאות המסכמות לפי תחום קוגניטיבי או אישיותי
    type: Map,
    of: new Schema({
      totalScore: { type: Number },
      zScore: { type: Number },//סטית תקן
      percentile: { type: Number }, // באחוזון יחסית לאוכלוסייה
      description: { type: String }
    }, { _id: false })//mongoos מוסיף אוטמטית שדה id עבור כל תת סכימה ולכן נגדיר כאן false שז"א שאין צורך בזה
  },

  rawScores: {
    type: Map,
    of: Number // אפשר לשמור ציונים גולמיים לפי תחום
  },

  status: { type: String, enum: ['in_progress', 'completed', 'cancelled'], default: 'in_progress' },

  notes: { type: String } // לצורך מידע נוסף בעתיד (למשל "נקטע באמצע", הערות אבחון וכו')
  
}, { timestamps: true });

module.exports = mongoose.model('TestSession', testSessionSchema);


// // models/testSession.js
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const testSessionSchema = new Schema({
//   userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

//   testType: { type: String, enum: ['psychotechnical', 'personality', 'full'], required: true }, // הוספתי 'full' אם תרצי לשלב את שני סוגי המבחנים בסשן אחד

//   startedAt: { type: Date, default: Date.now },

//   endedAt: { type: Date },

//   psychotechnicalQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PsychotechnicalQuestion' }],

//   personalityQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PersonalityQuestion' }],

//   answers: [{ type: Schema.Types.ObjectId, ref: 'userAnswer' }], // קישור לכל התשובות שנשמרו

//   currentQuestionIndex: { type: Number, default: 0 }, // מצביע לשאלה הנוכחית שהמשתמש נמצא בה

//   summary: {
//     // התוצאות המסכמות לפי תחום קוגניטיבי או אישיותי
//     type: Map,
//     of: new Schema({
//       totalScore: { type: Number },
//       zScore: { type: Number },//סטית תקן
//       percentile: { type: Number }, // באחוזון יחסית לאוכלוסייה
//       description: { type: String }
//     }, { _id: false })//mongoos מוסיף אוטמטית שדה id עבור כל תת סכימה ולכן נגדיר כאן false שז"א שאין צורך בזה
//   },

//   rawScores: {
//     type: Map,
//     of: Number // אפשר לשמור ציונים גולמיים לפי תחום
//   },

//   status: { type: String, enum: ['in_progress', 'completed', 'cancelled'], default: 'in_progress' },

//   notes: { type: String } // לצורך מידע נוסף בעתיד (למשל "נקטע באמצע", הערות אבחון וכו')

// }, { timestamps: true });

// module.exports = mongoose.model('TestSession', testSessionSchema);