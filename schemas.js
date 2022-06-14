const { object } = require('joi');
const Joi = require('joi');

module.exports.campgroundSchema = Joi.object({
    campgrounds:Joi.object({
        title:Joi.string().required(),
        price:Joi.number().required().min(0),
        // image:Joi.object({
        //     url:Joi.string().required(),
        //     filename:Joi.string().required()
        // }).required,
        location:Joi.string().required(),
        description:Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
})