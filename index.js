require('dotenv').config({
    path:'./.env'
})
const express=require("express")
const app = express();
const cookieParser = require("cookie-parser");
const mongoose=require('mongoose')
const Products=require('./models/productSchema')
const DefaultData=require('./defaultdata')
const cors=require('cors')
const router=require('./routes/router')

//database connection
require('./db/connection')
// DefaultData()
app.use(cors())


app.use(express.json())
app.use(cookieParser(""));
app.use(router)







DefaultData();
const port=process.env.port
app.listen(port,()=>{
    console.log(`Server running at port ${port}`)
})
