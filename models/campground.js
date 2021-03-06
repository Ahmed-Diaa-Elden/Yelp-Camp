const mongoose = require('mongoose');
const Review = require('./review');
const user = require('./user');
const Schema = mongoose.Schema;

function imagesArrayLimit(val){
    return val.length <= 5;
}


const imageSchema = new Schema({
    url:String,
    filename:String
})
imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload','/upload/w_200');
})
const opts = {toJSON:{virtuals:true}}; // to include virtuals when we convert a object to JSON
const campgroundSchema = new Schema({
    title:String,
    images:{
        type:[imageSchema],
        validate:[imagesArrayLimit,'You can max upload 5 images']
        },
    price:Number,
    description:String,
    geometry:{
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location:String,
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews:[{type:Schema.Types.ObjectId,ref:'Review'}]
},opts)

campgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.slice(0,20)}...</p>`
})

campgroundSchema.post('findOneAndDelete',async (doc)=>{
    if(doc){
        await Review.deleteMany({
            _id: {$in: doc.reviews}
        })
    }
})

module.exports = mongoose.model('Campground',campgroundSchema);