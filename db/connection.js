const mongoose=require('mongoose')
const DB=process.env.mongoUrl
console.log(DB)
mongoose.connect(DB).then(()=>console.log("Database connected")).catch((err)=>console.log("error",err.message))