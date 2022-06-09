const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground');
const {campgroundSchema} = require('../schemas');
const {isLoggedIn} = require('../middleware');

const validateCampground = (req,res,next)=>{
    const {error} = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el=> el.message).join(',');
        next(new ExpressError(msg,400))
    } else{
        next();
    }
}

router.get('/',catchAsync(async (req,res)=>{
    const campgrounds = await Campground.find();// please don't forget (await) as it take time to deal with database
    res.render('campgrounds/index',{campgrounds});
}))
router.get('/new', isLoggedIn,(req,res)=>{ // this get should be before the next get to give priority to 'new' and if not then consider it as :id
    res.render('campgrounds/new');
})
router.get('/:id', catchAsync(async (req,res)=>{
    const id = req.params.id; // same as --> const {id} = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    if(!camp) {
        req.flash('error','This campground is not exist')
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{camp});
}))
router.post('/', isLoggedIn,validateCampground,catchAsync(async (req,res)=>{
    // if (!req.body.campgrounds) next(new ExpressError('Invalid Campground Data',400)) // ملهاش لزوم أوي لأن ده بتمنع اللي هيبعت الداتا من خلال برنامج بوست مان إنما أنا عامل قيود على الموقع لو هيبعت منه
    const campgrounds = req.body.campgrounds; // Don't forget that to get the req.body elements we need to parse the body first and the same for JSON
    // console.log(campgrounds)
    const newCamp = new Campground(campgrounds)
    await newCamp.save();
    req.flash('success','Sucessfully made a new campground!')
    res.redirect(`/campgrounds/${newCamp._id}`);
}))
router.get('/:id/edit', isLoggedIn,catchAsync(async (req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp) {
        req.flash('error','This campground is not exist')
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{camp});
}))
router.put('/:id', isLoggedIn,validateCampground,catchAsync(async (req,res)=>{
    const campgrounds = req.body.campgrounds; // Don't forget that to get the req.body elements we need to parse the body first and the same for JSON
    const {id} = req.params;
    const editedCamp = await Campground.findByIdAndUpdate(id,campgrounds,{new:true,runValidators:true}); // if you want to spread the object you can do this {...campgrounds} instead of --> campgrounds and they both are the same
    req.flash('success','Sucessfully updated campground!')
    res.redirect(`/campgrounds/${editedCamp._id}`);
}))
router.delete('/:id', isLoggedIn,catchAsync(async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Sucessfully deleted campground!')
    res.redirect(`/campgrounds`);
}))

module.exports = router;