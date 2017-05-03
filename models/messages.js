var mongoose = require('mongoose');

/**
 * Create a schema (blueprint) for all messages in the database.
 * If you want to collect additional info, add the fields here.
 * We are setting required to true so that if the field is not
 * given, the document is not inserted. Unique will prevent
 * saving if a duplicate entry is found.
 */
var msgSchema = mongoose.Schema({

        location:   {
            	"type": { "type": String, default: "Point" },
            	"coordinates": [Number, Number]
        	},
        contents: {
        	imgFile:           String,
            imgFileDescrip:    String,
        	text:              String
        },
        datetime:              Date,
        expiresBy:             Date,
        postedBy: {
        	type: mongoose.Schema.Types.ObjectId,
        	ref: 'user'
    	}

});


msgSchema.index({ "location.coordinates": "2dsphere"});


// Our message model
var Message = mongoose.model('message', msgSchema);

// Make message model available through exports/require
module.exports = Message;