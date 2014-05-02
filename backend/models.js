var mongoose = require('mongoose');

var testSchema = new mongoose.Schema({
  title:  String,
  targets: [{ target_id: Number, pos: {x: Number, y: Number} }]
});

mongoose.model('Map', testSchema);

exports.Map = function(db) {
  return db.model('Map');
};