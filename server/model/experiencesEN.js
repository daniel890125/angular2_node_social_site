var mongoose = require('mongoose').set('debug', true);
var Schema = mongoose.Schema;

var experiencesSchemaEn=  new Schema();


var geoSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: 'Point',
      default: 'Point',
      index: {expires: 32}
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },

});

experiencesSchemaEn.add({
  infoProfilImage :Boolean,
  category : String,
  specCategory : String,
  price : Number,
  description : String,
  images : [Schema.Types.Mixed],
  title : String,
  companyName : String,
  dauer : String,
  city : String,
  address:String,
  nr:String,
  postcode:String,
  country:String,
  user : String,
  email : String,
  leistung : String,
  nameMain : String,
  review :Number,
  currency : String,
  lat:Number,
  long:Number,
  specSpecCategory:String,
  catplace:String,
  added:Boolean,
  offerDate: [],
  wishlist : [],
  loc : geoSchema,
  lat: Number,
  lon:Number,
  amountProduct:Number,
  aktivStatus:Boolean,
  lan:String,
  worldwide:Boolean,
  test:String

});
experiencesSchemaEn.set('autoIndex', false);
experiencesSchemaEn.index({ "loc": "2dsphere" });

var Experiences = mongoose.model('ExperiencesEn', experiencesSchemaEn);



module.exports = Experiences;
