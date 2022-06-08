const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override'); //to use Delete, PUT, .etc
const Campground = require('./models/campground');
const Review = require('./models/review');
//const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const {campgroundSchema,reviewSchema} = require('./schemas');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const session = require('express-session');
const { date } = require('joi');
const flash = require('connect-flash');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(()=>{
        console.log('Connected to MongoDB')
    })
    .catch((err)=>{
        console.log('Error in connection with MongoDB',err)
    })
}

app.use(express.static(path.join(__dirname,'/public'))); // to link css, js, images, .etc
app.use(methodOverride('_method')); // You can make the query be without underscore just change this line to --> app.use(methodOverride('method'));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    //store:,
    cookie: {
        httpOnly: true, // For security purposes
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,     // in mSec
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));

app.use('/campgrounds',campgrounds);
app.use('/campgrounds/:id/reviews',reviews);
app.get('/',(req,res)=>{
    res.render('home');
})

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})

app.use((err,req,res,next)=>{
    const {statusCode=500} = err;
    if(!err.message) err.message='Something went wrong';
    res.status(statusCode).render('error',{err});
})

app.listen(3000,()=>{
    console.log('Connected to port: 3000 Successfully');
})