const express = require('express');
const router = express.Router({ mergeParams:true }); // mergeParams --> to get ':id' content from the app.js file (The main route)
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const Review = require('../models/review');
const {validateReview,isLoggedIn,isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');
const review = require('../models/review');


router.post('/', isLoggedIn, validateReview,catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;