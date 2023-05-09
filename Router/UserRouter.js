const User = require('../model/User')
const router = require("express").Router()
const otp = require('../model/Otp')
const CryptoJS = require("crypto-js")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const Mailgen = require('mailgen');

//email
const transporter = nodemailer.createTransport({
    service:"gmail",
     auth:{
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
    }
})
console.log(transporter)

//rigester
router.post('/Register', async(req, res)=> {
    const userData = new User({
        email:req.body.email,
        logo:req.body.logo,
        password: CryptoJS.AES.encrypt(
            req.body.password,
            process.env.SECRET_KEY
    ).toString()
})
    try{
        const user = await userData.save();
        res.status(200).json(user)
    } catch(err){
       res.status(500).json(err) 
    }
})

//login
router.post("/login", async(req, res)=>{
    try{
        const user = await User.findOne({ email: req.body.email })
        !user && res.status(401).json("Wrong password or username");

        const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY)
        const origPassword = bytes.toString(CryptoJS.enc.Utf8);

        origPassword !== req.body.password && 
        res.status(401).json("Wrong password or username ")

        const accessToken = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY,
            { expiresIn : "1d"}
        )
        const { password, ...other} = user._doc;
        res.status(200).json({ ...other, accessToken });
        
    } catch(err){
        res.status(500).json(err)
    }
})

//otp 
router.post("/otp", async(req, res)=>{
    
    const findEmail = await otp.findOne({ email: req.body.email }) 
    console.log(findEmail);

    const OTP = Math.floor(100000 + Math.random() * 900000);
    
    if(!findEmail){
        const Userotp = new otp({
            email:req.body.email,
            otp: OTP
        })
        try{
            const userotp = await Userotp.save();
            res.status(200).json(userotp)

            //otpsentmail

            let config = {
                service : 'gmail',
                auth : {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            }
        
            let transporter = nodemailer.createTransport(config);
        
            let MailGenerator = new Mailgen({
                theme: "default",
                product : {
                    name: "Loominate",
                    link : 'https://mailgen.js/'
                }
            })
        
            let response = {
                body: {
                    name : "OTP-Verification",
                    intro: "Loominate",
                    table : {
                        data : [
                            {
                                OTP:OTP
                            }
                        ]
                    },
                    outro: "Do not share with others"
                }
            }
        
            let mail = MailGenerator.generate(response)
        
            let message = {
                from : process.env.EMAIL,
                to : req.body.email,
                subject: "Loominate-OTP",
                html: mail
            }
        
            transporter.sendMail(message).then(() => {
                return res.status(201).json({
                    msg: "you should receive an email"
                })
            }).catch(error => {
                return res.status(500).json({ error })
            })

        } catch(err){
           res.status(500).json(err) 
        }
    
    }else{
        try{
            const Up = await otp.findOneAndUpdate({ _id: findEmail._id },{
                otp: OTP
            },{ new: true })
            res.status(200).json(Up)

            let config = {
                service : 'gmail',
                auth : {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            }
        
            let transporter = nodemailer.createTransport(config);
        
            let MailGenerator = new Mailgen({
                theme: "default",
                product : {
                    name: "Loominate",
                    link : 'https://mailgen.js/'
                }
            })
        
            let response = {
                body: {
                    name : "OTP-Verification",
                    intro: "Loominate",
                    table : {
                        data : [
                            {
                                OTP:OTP
                            }
                        ]
                    },
                    outro: "Do not share with others"
                }
            }
        
            let mail = MailGenerator.generate(response)

            let message = {
                from : process.env.EMAIL,
                to : req.body.email,
                subject: "Loominate-OTP",
                html: mail
            }
        
            transporter.sendMail(message).then((data) => {
                console.log(data)
            }).catch(error => {
                console.log(error)
                // return res.status(500).json({ error })
            })
        }catch(err){
            // res.status(401).json(err)
            console.log(err)
        } 
    }
})   

//fetching

router.post("/fetchData", async(req, res)=>{
    try{
        // const data = await otp.findOne({email:req.body.email})
        const data = await otp.findOne({ email: req.body.email }) 
        console.log(data)
        res.status(200).json(data)
    }catch(err){
        res.status(500).json(err)
    }
    
    
    
})

module.exports = router;

