const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const passport = require('passport')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy


const app = express()
const port =3000
app.use(express.static('frontend'))
app.use(bodyParser.urlencoded({extended:false}))

app.set('view engine','ejs')

async function connectToMongoDB(){
    try{
        await mongoose.connect(process.env.uri,{
            useNewUrlParser: true,
      useUnifiedTopology: true,
      w:'majority'
        })
        console.log('Connected to mongoDb')
    }
    catch(err){
        console.log(`error ${err}`)
    }
}

const User = new mongoose.Schema(
    {
        name: String,
        email: { type:String },
        phone: Number,
        date: Date
    }

)
const user = mongoose.model('user',User)

const feedback = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
})

const feed = mongoose.model('feed',feedback)

app.get('/',async (req,res)=>{
   try{
    var feeds = await feed.find({})
    var feedList = [...feeds]
    res.render('index',{feedList:feedList})
   }
   catch(err){
    console.log(err)
   }
})
app.get('/book',(req,res)=>{
    res.sendFile(__dirname + '/frontend/book.html')
})

app.get('/feedback',(req,res)=>{
  res.sendFile(__dirname + '/frontend/feedback.html')
})

app.get('/abhi2002reviews',async (req,res)=>{
  try{
    var feeds = await feed.find({})
    var feedlist = [...feeds]
    res.render('adminreview',{feedlist: feedlist})
  }

  catch(err){
    console.log(err)
  }
})
app.post('/abhi2002reviews/:id',async(req,res)=>{
  try{
    let u = req.params.id
    await feed.findByIdAndDelete(u)
    res.redirect('/abhi2002reviews')
  }
  catch(err){
    console.log(err)
  }
})

app.post('/thanks',async (req,res)=>{
  try{
    var {name,email,message} = req.body
    const fback = new feed({
      name: name,
      email: email,
      message: message
    })
    await fback.save()
    res.sendFile(__dirname + '/frontend/thanks.html')
  }
  catch(err){
    console.log(err)
  }

})
app.post('/', async (req, res) => {
    try {
      const { name, number, email, dateInput } = req.body;
      const newUser = new user({
        name: name,
        email: email,
        phone: number,
        date: dateInput,
      });
      var thedate = dateInput
      thedate = thedate.toString()
      thedate = thedate.split("-").reverse(" ").join("-")
      await newUser.save();
      res.sendFile(__dirname + '/frontend/success.html');
      console.log('New User Added');
  
      // Create a Nodemailer transporter
      let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Replace with your SMTP server hostname
        port: 465, // Replace with your SMTP server port
        secure: true, // Set to true if your SMTP server requires SSL/TLS
        auth: {
            type: ' OAuth2',
          user: process.env.email, // Replace with your email address
          pass: process.env.pass, // Replace with your email password
        },
        tls: {
            ciphers:'SSLv3'
        }
      });
  
      // Prepare the email content
      let mailOptions = {
        from: '"Kum Kum" <kumkumparlour42@gmail.com>',
        to: email,
        subject: 'Registration Successful',
        text: 'Hello! Thank you for registering', // Plain text body
        html: `<p>
        Dear ${name},
          <br>
          <br>
        Warm greetings from Kum Kum beauty parlour! We wanted to reach out and express our heartfelt appreciation for registering with us. We are absolutely thrilled to welcome you to our esteemed beauty parlour! on date: <b> ${thedate} <b>       
        <br>
        
        Wishing you beauty and bliss,
        <br>
        <br>
        Kum Kum
      

        </p> `, // HTML body
      };
  
      try {
        // Send the email
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      } catch (error) {
        console.log('Error sending email:', error);
      }

      let mailOptions1 = {
        from: '"Kum Kum" <kumkumparlour42@gmail.com>',
        to: 'miskinsadanand@gmail.com',
        subject: 'New Registration',
        text: `New registration, ${name}`, // Plain text body
        html: ` Name:  ${name} <br>
        Phone No.:  ${number} <br>
        Email: ${email}
        On Date: ${thedate}`, // HTML body
      };
  
      try {
        // Send the email
        let info = await transporter.sendMail(mailOptions1);
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      } catch (error) {
        console.log('Error sending email:', error);
      }

    } catch (err) {
      console.error('error', err);
    }
  });
  

app.get('/admin',(req,res)=>{
    res.sendFile(__dirname+'/frontend/admin.html')

})
var username, pass
app.post('/admin',(req,res)=>{
   username = req.body.user
   pass = req.body.pass
})


app.post('/abhi2002/:id',async (req,res) =>{
    let userId = req.params.id
    try{
     await user.findByIdAndDelete(userId)
      res.redirect('/abhi2002')
    }catch(err){
      console.error(err)
    }
  })





app.get('/abhi2002', async (req,res)=>{
 try{
  var users = await user.find({})
  var userList = [...users]
  res.render('adminpage',{userList: userList})
 }
 catch(err){
  console.log('errror')
  res.send('Internal server error')
 }
})

connectToMongoDB()
app.listen(port || process.env.port ,(req,res)=>{
    console.log(`server listening at ${port}`)
})
