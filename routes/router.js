const express=require('express')
const router=express.Router()
const products=require('../models/productSchema')
const USER=require('../models/userSchema')
const bcrypt = require("bcryptjs");
const authenicate=require('../middleware/authenticate')
//GET PRODUCT API
router.get("/getproducts", async (req, res) => {
    try {
        const producstdata = await products.find();
        // console.log({"producstdata" :producstdata});
        res.status(201).json(producstdata);
    } catch (error) {
        console.log({"error" : error.message});
    }
});


//GET INDIVIDUAL DATA
router.get('/singleproduct/:id',async(req,res)=>{
    try{
const {id}=req.params
// console.log(id)
const individualdata=await products.findOne({id:id})
// console.log(individualdata+ "individual data")
res.status(201).json(individualdata)
    }
    catch(err){
        res.status(400).send("Error in getting singleproductdata",err.message)

    }
})


// register the data
router.post('/register',async(req,res)=>{
    // console.log(req.body)
    const { fname, email, mobile, password, cpassword } = req.body;
    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(400).json({ error: "filll the all details" });
        console.log("All the fields must be present");

    };
    try{

        //if uuser already present or not
        const preuser = await USER.findOne({ email: email });
        if (preuser) {
            res.status(422).json({ error: "This email is already exist" });
        } else if (password !== cpassword) {
            res.status(422).json({ error: "password are not matching" });;
    }else {

        const finaluser = new USER({
            fname, email, mobile, password, cpassword
        });

        // hasing should be done here before saving data in database
//save method is used to insert a single document 
        const storedata = await finaluser.save();
        console.log(storedata + "user successfully added");
        res.status(201).json(storedata);
    }}
    catch(error){
        console.log("Please try Again!!!" + error.message);
        res.status(422).send(error);
    }
})





// login data

router.post("/login", async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).send("fill all the details" );
    }

    try {

        const userlogin = await USER.findOne({ email: email });
        // console.log(userlogin);
        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
            // console.log(isMatch);


            //token generate in schema
            //here we are calling the function that we wrote in schema for generatig token that is returning token
            

            if (!isMatch) {
                res.status(400).send("invalid crediential pass" );
            }
             else {
                
                

           
                res.status(201).json(userlogin);
            }

        }else {
            const token = await userlogin.generatAuthtoken();
            console.log(token);
            res.cookie("mycoookieforamazonclone", token, {
                expires: new Date(Date.now() + 2589000),
                httpOnly: true
            });

            console.log("invalid details")
            res.status(400).json({"error": "invalid details" });
        }
        
    } catch (error) {
        res.status(400).json({ error: "invalid crediential pass" });
        // console.log("error the bhai catch ma for login time" + error.message);
    }
});




//adding data into the cart

router.post("/addcart/:id", authenicate, async (req, res) => {

    try {
        console.log("perfect 6");
        const { id } = req.params;
        const cart = await products.findOne({ id: id });
        console.log(cart + "cart value");

        //this user id s coming from middleware i.e authenticate

        const Usercontact = await USER.findOne({ _id: req.userID });
        console.log(Usercontact );

//if only we are getting user then we will call the fnction addcartdata so that data gets added in user's cart section
        if (Usercontact) {
            const cartData = await Usercontact.addcartdata(cart);

            await Usercontact.save();
            console.log(cartData);
            // console.log(Usercontact + "userjode save");
            res.status(201).json(Usercontact);
        }
    } catch (error) {
        console.log(error);
    }
});

//get cart detals
//we are getting req.userID from middleware authenticate
router.get("/cartdetails",authenicate,async(req,res)=>{
    try{
const buyuser=await USER.findOne({_id:req.userID})
res.status(201).json(buyuser)
    }
    catch(error){
        console.log("error"+ error)
    }
})



//to get valid user 
//this we are writing just to check if the user is logged in or not
//so we will call this route when the user comes to website
//i.e at navabar in the frontedn
router.get("/validuser",authenicate,async(req,res)=>{
    try{
const validuserone=await USER.findOne({_id:req.userID})
res.status(201).json(validuserone)
    }
    catch(error){
        console.log("error"+ error)
    }
})











//for delete option
router.get("/remove/:id", authenicate, async (req, res) => {
    try {
        const { id } = req.params;

        req.rootUser.carts = req.rootUser.carts.filter((curel) => {
            return curel.id != id
        });

        req.rootUser.save();
        res.status(201).json(req.rootUser);
        console.log("item remove");

    } catch (error) {
        console.log(error + "jwt provide then remove");
        res.status(400).json(error);
    }
});


// for userlogout

router.get("/logout", authenicate, async (req, res) => {
    try {
        //we are removing tokens
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
            return curelem.token !== req.token
        });

        res.clearCookie("eccomerce", { path: "/" });
        req.rootUser.save();
        res.status(201).json(req.rootUser.tokens);
        console.log("user logout");

    } catch (error) {
        console.log(error + "jwt provide then logout");
    }
});


module.exports=router