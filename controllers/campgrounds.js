const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary/index')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken:mapBoxToken});


module.exports.index = async (req,res)=>{
    const campgrounds = await Campground.find();// please don't forget (await) as it take time to deal with database
    res.render('campgrounds/index',{campgrounds});
};

module.exports.renderNewForm = (req,res)=>{ // this get should be before the next get to give priority to 'new' and if not then consider it as :id
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req,res)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campgrounds.location,
        limit: 1
    }).send()
    // if (!req.body.campgrounds) next(new ExpressError('Invalid Campground Data',400)) // ملهاش لزوم أوي لأن ده بتمنع اللي هيبعت الداتا من خلال برنامج بوست مان إنما أنا عامل قيود على الموقع لو هيبعت منه
    const camp = req.body.campgrounds; // Don't forget that to get the req.body elements we need to parse the body first and the same for JSON
    // console.log(campground)
    const newCamp = new Campground(camp);
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.images = req.files.map(f => ({url: f.path,filename: f.filename}));
    newCamp.author = req.user._id;
    await newCamp.save();
    console.log(newCamp);
    req.flash('success','Sucessfully made a new campground!')
    res.redirect(`/campgrounds/${newCamp._id}`);
};

module.exports.showCampground = async (req,res)=>{
    const id = req.params.id; // same as --> const {id} = req.params;
    // const camp = await Campground.findById(id).populate('reviews').populate('author'); 
    // I will show you how to make nested populte
    const camp = await Campground.findById(id).populate({
        path: 'reviews',
        populate:{
            path:'author' // Sothat we can display the review's author username
        }
    }).populate('author'); 

    // console.log(camp)
    if(!camp) {
        req.flash('error','This campground is not exist')
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{camp});
};

module.exports.renderEditForm = async (req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp) {
        req.flash('error','This campground is not exist')
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{camp});
};

module.exports.updateCampground = async (req,res)=>{
    const camp = req.body.campgrounds; // Don't forget that to get the req.body elements we need to parse the body first and the same for JSON
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campgrounds.location,
        limit: 1
    }).send()
    // console.log(req.body)
    const {id} = req.params;
    const editedCamp = await Campground.findByIdAndUpdate(id,camp,{new:true,runValidators:true}); // if you want to spread the object you can do this {...camp} instead of --> campgrounds and they both are the same
    const imgs = req.files.map(f => ({url: f.path,filename: f.filename}));
    editedCamp.geometry = geoData.body.features[0].geometry;
    editedCamp.images.push(...imgs);
    await editedCamp.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await editedCamp.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}});
    }
    req.flash('success','Sucessfully updated campground!')
    res.redirect(`/campgrounds/${editedCamp._id}`);
};

module.exports.deleteCampground = async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Sucessfully deleted campground!')
    res.redirect(`/campgrounds`);
};

// module.exports.