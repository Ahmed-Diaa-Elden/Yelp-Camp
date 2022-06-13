const Campground = require('../models/campground');
const Review = require('../models/review');



module.exports.createReview = async (req , res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review({...req.body.review,author:req.user._id});
    // console.log(review)
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Sucessfully made a new review!');
    res.redirect(`/campgrounds/${campground._id}`)
};
module.exports.deleteReview = async (req,res)=>{
    await Campground.findByIdAndUpdate(req.params.id,{ $pull: {reviews: req.params.reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success','Sucessfully deleted a review!');
    res.redirect(`/campgrounds/${req.params.id}`)
};
// module.exports.
