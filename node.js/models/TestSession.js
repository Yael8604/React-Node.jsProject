const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestSessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    testType: { type: String, required: true }, // 'psychotechnical', 'personality'
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    status: { type: String, enum: ['in_progress', 'completed', 'cancelled'], default: 'in_progress' },
    // שמירת רשימת ה-IDs של התשובות שניתנו בסשן זה
    answers: [{ type: Schema.Types.ObjectId, ref: 'UserAnswer' }],
    // ציון גולמי של המבחן, יכול להיות ממופה לסוגי ציונים שונים
    rawScores: {
        type: Map,
        of: Number, // לדוגמה: { 'psychotechnical': 85, 'personality_openness': 0.75 }
        default: {}
    },
    // חדש: מבנה לניהול חלקי הבחינה
    sections: [{
        sectionName: { type: String, required: true },
        questionIds: [{ type: Schema.Types.ObjectId, ref: 'PsychotechnicalQuestion' }], // השאלות הספציפיות לחלק זה
        timeLimitSeconds: { type: Number, required: true }, // זמן מוקצב לחלק זה בשניות
        // ניתן להוסיף:
        // startedAt: { type: Date },
        // endedAt: { type: Date },
        // currentScore: { type: Number, default: 0 },
        // isCompleted: { type: Boolean, default: false }
    }],
    currentSectionIndex: { type: Number, default: 0 }, // האינדקס של החלק הנוכחי שהמשתמש נמצא בו
    // ניתן להוסיף: lastQuestionIndexInSection: { type: Number }
}, { timestamps: true });

const TestSession = mongoose.model('TestSession', TestSessionSchema);
module.exports = TestSession;