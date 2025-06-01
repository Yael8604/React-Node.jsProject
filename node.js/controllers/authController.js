const User = require("../models/User/user")
const bcrypt= require('bcrypt')
const jwt = require('jsonwebtoken');

const login = async (req,res)=>{
    const {username, password} = req.body
    if (!username || !password) {
        return res.status(400).json({message:'All fields are required'})
    }
    const foundUser = await User.findOne({username}).lean()
    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    const match = await bcrypt.compare(password, foundUser.password)
    if(!match)return res.status(401).json({message:'Unauthorized' })
    const userInfo= {_id:foundUser._id,name:foundUser.name,
    // roles:foundUser.roles,
    username:foundUser.username,
    email:foundUser.email}
    const accessToken=jwt.sign(userInfo,process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // **שנה ל-true בייצור**
        sameSite: 'Lax',
        domain: 'localhost',
        maxAge: 3600000,
      });
    return res.json({ message: "Logged In successfully!" });
    
}

const register = async (req,res)=>{
    const {username, password, name, email, phone , birthDate} = req.body
    if (!name || !username || !password || !birthDate) {// Confirm data
        return res.status(400).json({message:'All fields are required'})
    }
    const duplicate = await User.findOne({username:username}).lean()
    if(duplicate){
    return res.status(409).json({message:"Duplicate username"})
    }
    const hashedPwd = await bcrypt.hash(password, 10)
    const userObject= {name,email,username,phone, birthDate,password:hashedPwd}
    const user = await User.create(userObject)
    if (user) { // Created
    return res.status(201).json({message:`New user ${user.username}
    created` })
    } else {
    return res.status(400).json({message:'Invalid user received'})
    }
}

const logout = (req, res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        sameSite: 'Lax', // חשוב שיהיה תואם להגדרות ב-login
        secure: process.env.NODE_ENV === 'production' // ב-production להעביר ל-true
    });
    return res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { login, register, logout }; // הוספת logout לייצוא