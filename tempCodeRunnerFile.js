//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));


// initializing session //
app.use(session({
  secret: "Our little secret.",
  resave: false,                
  saveUninitialized: false     
}));

//initializing passport //
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema =new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

//passport serialize and deserialize comes only when we use sessions 

passport.serializeUser(User.serializeUser());   //creates the active cookie and stuffs the message mainly users authication //
passport.deserializeUser(User.deserializeUser()); //allows passport to crumble the cookie and discover the msg inside and who the user is .//

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else{
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/")
})

app.post("/register", function(req, res){
 User.register({ username : req.body.username}, req.body.password, function(err , User){
  if(err){
    console.log(err);
    res.redirect("/register");
  }
  else{
    passport.authenticate("local")(req, res, function(){
      res.redirect("/secrets")
    }) 
  }
 });
});

app.post("/login", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});














app.listen(3000, function() {
  console.log("Server started on port 3000.");
});