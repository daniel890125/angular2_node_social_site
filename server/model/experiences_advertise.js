var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var experiencesSchemaAdvertise = new Schema({

  infoProfilImage :Boolean,
  category : String,
  specCategory : String,
  price : Number,
  description : String,
  images : [mongoose.Schema.Types.Mixed],
  title : String,
  companyName : String,
  productUrl : String,
  city : String,
  address:String,
  nr:String,
  postcode:String,
  country:String,
  user : String,
  email : String,
  giftCard : Boolean,
  nameMain : String,
  review :Number,
  currency : String,
  offerDate: []

});

var Experiences = mongoose.model('ExperiencesAdvertise', experiencesSchemaAdvertise);

module.exports = Experiences;
