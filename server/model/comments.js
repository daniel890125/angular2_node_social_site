var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commentsSchema = new Schema({

    _creator : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    _roomID :Schema.Types.ObjectId,
    comment : String,
    star : Number,
    namePerson : String,

    created_at : Date,
    updated_at : Date
});

var Comments = mongoose.model('Comments', commentsSchema);

module.exports = Comments;