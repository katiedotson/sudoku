var mongoose = require('mongoose');
var passport = require('passport');
var User = require('./user.js');

var sudokusSchema = mongoose.Schema({
    userId : String,
    userPuzzles : []
});

var SudokuPuzzle = mongoose.model('SudokuPuzzles', sudokusSchema);

module.exports = SudokuPuzzle;

