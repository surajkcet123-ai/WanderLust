if(process.env.NODE_ENV != "production"){
require('dotenv').config()
}



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");
const dburl = process.env.ATLASDB_URL;
mongoose.set("strictQuery", true);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"public")));

main()
.then(() => {
    console.log("connected to DB");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dburl);
};

const store = MongoStore.create({
    mongoUrl: dburl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

const sessionOption = {
    store,
    secret : process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    },
};
store.on("error", (err) =>{
    console.log("Error in MONGO Sesssion Store",err);
})

app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
res.locals.success = req.flash("success");
res.locals.error = req.flash("error");
res.locals.currUser = req.user;
next();
});
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);
app.use((req,res,next) => {
    next(new ExpressError(404,"Page not found!"));
});

app.use((err,req,res,next) =>{
    let{statusCode = 500,message = "Something went wrong"} = err;
    res.status(statusCode).render("listings/error.ejs", {message});
});
app.listen (8080,() => {
    console.log("Server is listening to port 8080");
});