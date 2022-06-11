const express = require('express');
const router = express.Router({ mergeParams:true }); // mergeParams --> to get ':id' content from the app.js file (The main route)
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const Review = require('../models/review');
const {validateReview,isLoggedIn,isReviewAuthor} = require('../middleware');

router.post('/', isLoggedIn, validateReview,catchAsync(async (req , res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review({...req.body.review,author:req.user._id});
    console.log(review)
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Sucessfully made a new review!');
    res.redirect(`/campgrounds/${campground._id}`)
}))
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req,res)=>{
    await Campground.findByIdAndUpdate(req.params.id,{ $pull: {reviews: req.params.reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success','Sucessfully deleted a review!');
    res.redirect(`/campgrounds/${req.params.id}`)
}))

module.exports = router;