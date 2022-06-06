const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const Campground = require('./models/campground');

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
app.use(methodOverride('_method')); // You can make the query be without underscore just change this line to --> app.use(methodOverride('method'));
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));

app.get('/',(req,res)=>{
    res.render('home');
})
app.get('/campgrounds',async (req,res)=>{
    const campgrounds = await Campground.find();// please don't forget (await) as it take time to deal with database
    res.render('campgrounds/index',{campgrounds});
})
app.get('/makecampground',async (req,res)=>{
    const camp = Campground({title:'My Backyard',description:'Cheap Camping'})
    await camp.save();
    res.send(camp);
})
app.get('/campgrounds/new',(req,res)=>{ // this get should be before the next get to give priority to 'new' and if not then consider it as :id
    res.render('campgrounds/new');
})
app.get('/campgrounds/:id',async (req,res)=>{
    const id = req.params.id; // same as --> const {id} = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/show',{camp});
})
app.post('/campgrounds',async (req,res)=>{
    const campgrounds = req.body.campgrounds; // Don't forget that to get the req.body elements we need to parse the body first and the same for JSON
    const newCamp = new Campground(campgrounds)
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
})
app.get('/campgrounds/:id/edit',async (req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/edit',{camp});
})
app.put('/campgrounds/:id',async (req,res)=>{
    const campgrounds = req.body.campgrounds; // Don't forget that to get the req.body elements we need to parse the body first and the same for JSON
    const {id} = req.params;
    const editedCamp = await Campground.findByIdAndUpdate(id,campgrounds,{new:true,runValidators:true}); // if you want to spread the object you can do this {...campgrounds} instead of --> campgrounds and they both are the same
    res.redirect(`/campgrounds/${editedCamp._id}`);
})
app.delete('/campgrounds/:id',async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
})


app.listen(3000,()=>{
    console.log('Connected to port: 3000 Successfully');
})