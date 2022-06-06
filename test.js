// const path = require('path');
// console.log(`${path.join(__dirname,'/../public')}/images/${(Math.floor(Math.random()*10)+1)}.jpg`)
const mongoose = require('mongoose');
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

async function test1() {
    // await Campground.deleteMany({});
    
    console.log(await Campground.findById('625edc294fa3108b223f29ec'));
}

test1().then(()=>{
    mongoose.connection.close();
})