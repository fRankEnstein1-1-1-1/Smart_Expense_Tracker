const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const RegisterUser = async(req,res)=>{
    try{
        const {name,email,password} = req.body
        const existingUser = await User.findOne({email})
        if(existingUser){
           return res.status(401).json({message : "User already exist"}
            )
        }
        const hashedPassword = await bcrypt.hash(password,10)
        const SignedUser = new User({
            name,
            email,
            password : hashedPassword,
        })
        await SignedUser.save()
         res.status(201).json({
      message: "User registered successfully"
    });
    }
    catch(error){
        return res.status(501).json({message:"cant register any user"})
    }
}

const LoginUser = async(req,res)=>{
    try{
        const {email,password} = req.body;
    const user = await  User.findOne({email})
    if(!user){
        return res.status(401).json({message:"Signup First"})
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    }
    catch(error){
        res.status(501).json({message:"cant Login"})
    }
}

module.exports = {
  RegisterUser,
  LoginUser
};
