module.exports.isLoggedIn = (req,res,next)=>{
    // console.log('REQ.USER...',req.user)
    if(!req.isAuthenticated()){
        // console.log(req.path,req.originalUrl);
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be signed in first')
        return res.redirect('/login');
    }
    next();
}
module.exports.isLoggedOut = (req,res,next)=>{
    // console.log('REQ.USER...',req.user)
    if(req.isAuthenticated()){
        req.flash('error','You must logout to login')
        return res.redirect('/campgrounds');
    }
    next();
}
