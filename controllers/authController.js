const User = require("../models/User/user")
const bcrypt= require('bcrypt')

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
    res.send("Logged In")
}
const register = async (req,res)=>{
    const {username, password, name, email, phone} = req.body
    if (!name || !username || !password) {// Confirm data
        return res.status(400).json({message:'All fields are required'})
    }
    const duplicate = await User.findOne({username:username}).lean()
    if(duplicate){
    return res.status(409).json({message:"Duplicate username"})
    }
    const hashedPwd = await bcrypt.hash(password, 10)
    const userObject= {name,email,username,phone,password:hashedPwd}
    const user = await User.create(userObject)
    if (user) { // Created
    return res.status(201).json({message:`New user ${user.username}
    created` })
    } else {
    return res.status(400).json({message:'Invalid user received'})
    }
}


module.exports = {login, register}