const express = require("express");
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const port = 3000;

const uri = process.env.MONGO_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB database connection established successfully'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

app.listen(port,function(){
    console.log("server running on port 3000");
})

app.get('/',function(req,res){
    res.send('שלום עולם');
})

app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"))