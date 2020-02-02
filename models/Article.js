var mongoose = require('mongoose');

// Save a reference to Schema constructor
var Schema = mongoose.Schema;

// Creating a new object from the Schema constructor
var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    saved: {
        type: Boolean,
        default: false
    },
    note: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Note'
        }]
    }
});

// create the model named Article
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;