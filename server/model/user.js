var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var userSchema = new Schema({

	local		: {
		id		 : String,
		token	 : String,
		email	 : String,
		password : String,
		nameMain : String
	},
	profileImage : String,
	job: String,
	description: String,
	age: Number,
	role:Number,
	created_at : Date,
	updated_at : Date,
	facebook         : {
		id           : String,
		token        : String,
		email        : String,
		name         : String
	},
	twitter          : {
		id           : String,
		token        : String,
		displayName  : String,
		username     : String
	},
	google           : {
		id           : String,
		token        : String,
		email        : String,
		name         : String
	},
	friendlist: [],
	visiterlist: []
});

// generating a hash
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

var User = mongoose.model('User', userSchema);

module.exports = User;