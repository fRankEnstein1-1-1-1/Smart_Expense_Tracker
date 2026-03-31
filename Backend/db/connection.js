const mongoose = require("mongoose")

const connectDB = async ()=>{
    try{
        mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB has been connected");
    }
    catch(error){
        console.log("cant connect to mongo")
    }
}

module.exports = connectDB