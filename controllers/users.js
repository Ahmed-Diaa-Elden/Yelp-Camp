const User = require('../models/user');



module.exports.renderRegister = (req,res)=>{
    res.render('users/register');
};
module.exports.register = async (req,res)=>{
    try{
    const {email,username,password} = req.body;
    const user = new User({email,username});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser, (err)=>{
        if(err) return next(err);
            req.flash('success','Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
    })
    } catch(e){
        req.flash('error',e.message) // to show flash error for error like didn't use unique 'username'
        res.redirect('/register')
    }
};
module.exports.renderLogin = (req,res)=>{
    res.render('users/login')
};
module.exports.login = async (req,res)=>{
    req.flash('success', `Welcome Back ${req.user.username}`);
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo ;
    res.redirect(redirectUrl);
};
module.exports.logout = (req,res)=>{
    req.logOut();
    req.flash('success','Goodbye!!');
    res.redirect('/campgrounds');
};
// module.exports.