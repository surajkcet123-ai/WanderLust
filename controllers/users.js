const User = require("../models/user.js");

module.exports.renderSignupForm = (req,res) => {
    res.render("users/signup");
};

module.exports.signup = async(req,res,next) => {
    try{
        let {username,email,password} = req.body;
let newUser = new User({email,username});
const registerdUser = await User.register(newUser,password);
req.login(registerdUser, (err) => {
if(err) {
    return next(err);
}
req.flash("success", "Welcome to Wonderlust");
res.redirect("/listings");
});

    } catch(er){
        req.flash("error", er.message);
        res.redirect("/signup");
    }

};


module.exports.renderLoginForm = async(req,res)=>{
res.render("users/login");
};


module.exports.login = async (req,res)=> {
   req.flash("success", "Welcome to Wonderlust! You are login!");
   let redirectUrl = res.locals.redirectUrl || "/listings"
   res.redirect(redirectUrl);
};

module.exports.logout =  (req,res,next) =>{
    req.logout((err) => {
        if(err){
            return next(err);
        }
    });
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
};