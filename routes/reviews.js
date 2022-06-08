const express = require('express');
const router = express.Router({ mergeParams:true }); // mergeParams --> to get ':id' content from the app.js file (The main route)
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground');
const Review = require('../models/review');
const {reviewSchema} = require('../schemas');

const validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=> el.message).join(',');
        next(new ExpressError(msg,400));
    } else {
        next();
    }
}

router.post('/', validateReview,catchAsync(async (req , res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Sucessfully made a new review!');
    res.redirect(`/campgrounds/${campground._id}`)
}))
router.delete('/:reviewId',catchAsync(async (req,res)=>{
    await Campground.findByIdAndUpdate(req.params.id,{ $pull: {reviews: req.params.reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success','Sucessfully deleted a review!');
    res.redirect(`/campgrounds/${req.params.id}`)
}))

module.exports = router;