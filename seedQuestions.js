require('dotenv').config();
const mongoose = require('mongoose');
const PsychotechnicalQuestion = require('./models/Question/psychotechnicalQuestion'); // עדכני לפי הנתיב שלך

// חיבור למסד הנתונים
console.log(process.env.MONGO_URI); // הדפסת ה-MONGO_URI
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  seedQuestions();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

async function seedQuestions() {
  const questions = [
    {
      type: 'psychotechnical',
      text: 'מהי המילה החריגה: כלב, חתול, סוס, בננה?',
      testPart: 'חשיבה מילולית',
      options: ['כלב', 'חתול', 'סוס', 'בננה'],
      correctAnswer: 'בננה',
      ability: 'חשיבה מילולית',
      difficulty: 'קל'
    },
    {
      type: 'psychotechnical',
      text: 'איזה מספר ממשיך את הסדרה: 2, 4, 8, 16, ?',
      testPart: 'חשיבה כמותית',
      options: ['18', '24', '32', '30'],
      correctAnswer: '32',
      ability: 'חשיבה כמותית',
      difficulty: 'בינוני'
    }

  ];

  try {
    const existingQuestions = await PsychotechnicalQuestion.find({});
    if (existingQuestions.length === 0) {
      await PsychotechnicalQuestion.insertMany(questions);
    }
    console.log('Questions inserted successfully!');
  } catch (err) {
    console.error('Error inserting questions:', err);
  } finally {
    mongoose.connection.close();
  }
}
