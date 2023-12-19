const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  name: String,
  img: String,
  link: String,
});

const Location = mongoose.model('locations', Schema);

module.exports = Location;