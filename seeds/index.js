const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');

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

const sample = array => array[Math.floor(Math.random() * array.length)];

async function seedDB() {
    await Campground.deleteMany({});
    for(let i = 0;i<50;i++){
        const random1000= Math.floor(Math.random()*1001);
        const camp = new Campground({location:`${cities[random1000].city}, ${cities[random1000].state}`,title:`${sample(descriptors)} ${sample(places)}`});
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})