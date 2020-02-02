var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    // `title` is of type String
    title: String,
    // `body` is of type String
    body: String
});

// creates a model named Note
var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;