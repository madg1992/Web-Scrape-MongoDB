var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    body: {
        type: String,
        required: true,
        trim: true
    }
});

// creates a model named Note
var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;