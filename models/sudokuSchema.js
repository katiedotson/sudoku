var mongoose = require('mongoose');
var passport = require('passport');
var User = require('./user.js');

// var Puzzle = {
//         DidntWork: Boolean, 
//         Array: [], 
//         NumberToShow: {type: Number, min: 17, max: 52}, 
//         NumberShown: {type: Number, min: 17, max: 81}, 
//         IncorrectInput: {type: Number},
//         BoxesClicked: {type: Number}, 
//         HighlightColor: String, 
//         CompletedColor: String, 
//         NotesMode: Boolean, 
//         OopsMode: Boolean,
//         IdOfCurrentValue: {type: Number, min: 0, max: 9}, 
//         Playing: Boolean, 
//         ColorMode: Boolean, 
//         HardMode: Boolean, 
//         CurrentValue: {type: Number}, 
//         Hints: {type: Number, min: 0, max: 3},
//         ColorArray:[]
// };

var sudokusSchema = mongoose.Schema({
    userId : String,
    userPuzzles : []
});

var SudokuPuzzle = mongoose.model('SudokuPuzzles', sudokusSchema);

module.exports = SudokuPuzzle;

