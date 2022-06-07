const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const {campgroundSchema,reviewSchema} = require('./schemas');
const Review = require('./models/review');

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
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const validateCampground = (req,res,next)=>{
    const {error} = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el=> el.message).join(',');
        next(new ExpressError(msg,400))
    } else{
        next();
    }
}
const validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=> el.message).join(',');
        next(new ExpressError(msg,400));
    } else {
        next();
    }
}

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));

app.get('/',(req,res)=>{
    res.render('home');
})
app.get('/campgrounds',catchAsync(async (req,res)=>{
    const campgrounds = await Campground.find();// please don't forget (await) as it take time to deal with database
    res.render('campgrounds/index',{campgrounds});
}))
app.get('/makecampground',catchAsync(async (req,res)=>{
    const camp = Campground({title:'My Backyard',description:'Cheap Camping'})
    await camp.save();
    res.send(camp);
}))
app.get('/campgrounds/new',(req,res)=>{ // this get should be before the next get to give priority to 'new' and if not then consider it as :id
    res.render('campgrounds/new');
})
app.get('/campgrounds/:id',catchAsync(async (req,res)=>{
    const id = req.params.id; // same as --> const {id} = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show',{camp});
}))
app.post('/campgrounds',validateCampground,catchAsync(async (req,res)=>{
    // if (!req.body.campgrounds) next(new ExpressError('Invalid Campground Data',400)) // ملهاش لزوم أوي لأن ده بتمنع اللي هيبعت الداتا من خلال برنامج بوست مان إنما أنا عامل قيود على الموقع لو هيبعت منه
    const campgrounds = req.body.campgrounds; // Don't forget that to get the req.body elements we need to parse the body first and the same for JSON
    // console.log(campgrounds)
    const newCamp = new Campground(campgrounds)
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
}))
app.get('/campgrounds/:id/edit',catchAsync(async (req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/edit',{camp});
}))
app.put('/campgrounds/:id',validateCampground,catchAsync(async (req,res)=>{
    const campgrounds = req.body.campgrounds; // Don't forget that to get the req.body elements we need to parse the body first and the same for JSON
    const {id} = req.params;
    const editedCamp = await Campground.findByIdAndUpdate(id,campgrounds,{new:true,runValidators:true}); // if you want to spread the object you can do this {...campgrounds} instead of --> campgrounds and they both are the same
    res.redirect(`/campgrounds/${editedCamp._id}`);
}))
app.delete('/campgrounds/:id',catchAsync(async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
}))
app.post('/campgrounds/:id/reviews', validateReview,catchAsync(async (req , res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))
app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async (req,res)=>{
    await Campground.findByIdAndUpdate(req.params.id,{ $pull: {reviews: req.params.reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/campgrounds/${req.params.id}`)
}))

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