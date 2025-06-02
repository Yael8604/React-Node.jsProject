const express = require("express");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const cors = require('cors');
// const connectDB = require('./config/db');//לא בטוח צריך את השורה הזו

const userRoutes = require('./routes/userRoutes');
const questionRoutes = require('./routes/questionRoutes');
const testSessionRoutes = require('./routes/testSessionRoutes');

dotenv.config();
// connectDB();//לא בטוח צריך את השורה הזו

const app = express();
const port = 3000;
const uri = process.env.MONGO_URI;

app.use(express.json());//בשביל שנוכל להוסיף תוכן בbody בפורמט json בקריאות HTTP בthunder client
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:3001',  // כתובת ה-Frontend
  credentials: true, // מאפשר שליחה של cookies מצד ה-Client
}));

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB database connection established successfully'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

app.listen(port,function(){
    console.log("server running on port 3000");
})

app.get('/',function(req,res){
    res.send('שלום עולם');
})

app.use("/api/auth", require("./routes/authRoutes"))
app.use('/api/users', userRoutes);
app.use('/api', questionRoutes);
app.use('/api/testSessions', testSessionRoutes);

