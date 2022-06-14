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
const campgroundSchema = new Schema({
    title:String,
    images:{
        type:[imageSchema],
        validate:[imagesArrayLimit,'You can max upload 5 images']
        },
    price:Number,
    description:String,
    location:String,
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews:[{type:Schema.Types.ObjectId,ref:'Review'}]
})


campgroundSchema.post('findOneAndDelete',async (doc)=>{
    if(doc){
        await Review.deleteMany({
            _id: {$in: doc.reviews}
        })
    }
})

module.exports = mongoose.model('Campground',campgroundSchema);