const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const {isLoggedIn,isAuthor,validateCampground} = require('../middleware');
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer');
// const upload = multer({dest: 'uploads/'}) // if you run this code and uploaded any file you will see new folder named 'uploads' as this code for storing files locally
const {storage} = require('../cloudinary/index'); // same as "const {storage} = require('../cloudinary')" as node always looks for index.js file in a folder
const upload = multer({storage});

router.route('/')
    .get(catchAsync(campgrounds.index)) // this chaining ("تسلسل") shouldn't use a semicolon ';'
    .post(isLoggedIn,upload.array('image',5),validateCampground,catchAsync(campgrounds.createCampground))


router.get('/new', isLoggedIn,campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor,upload.array('image',5), validateCampground, catchAsync(campgrounds.updateCampground))
    // we can chain it like that, if you want for long code line
    // .put(
    //     isLoggedIn, 
    //     isAuthor, 
    //     validateCampground, 
    //     catchAsync(campgrounds.updateCampground))  
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


module.exports = router;