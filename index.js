const express = require("express");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const questionRoutes = require('./routes/questionRoutes');

dotenv.config();

const app = express();
const port = 3000;
const uri = process.env.MONGO_URI;

app.use(express.json());//בשביל שנוכל להוסיף תוכן בbody בפורמט json בקריאות HTTP בthunder client

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB database connection established successfully'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

app.use('/api', questionRoutes);

app.listen(port,function(){
    console.log("server running on port 3000");
})

app.get('/',function(req,res){
    res.send('שלום עולם');
})

app.use("/api/auth", require("./routes/authRoutes"))