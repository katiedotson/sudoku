/* jshint esversion: 6 */

const express = require('express');
const router = express.Router();
var sudoku = require('../models/sudokus.js');
var bodyParser = require('body-parser');
var SudokuPuzzles = require('../models/sudokuSchema.js');
var passport = require('passport');

router.get('/', (req,res)=>{
    res.render('doAquarium');
});

router.get('/login', (req,res)=>{
    res.render('login');
});

router.get('/sudoku', (req, res)=>{
    res.render('sudoku');
});

router.get('/sudokuObject', (req, res) =>{ 
    if(req.session.puzzleInt){
        //if there was a request made for a specific puzzle, send that
        console.log('request successful');
        SudokuPuzzles.findOne({userId : req.session.user}, (err, sudokuPuzzles)=>{
            if(err){
                console.log(err);
                return;
            }
            if(sudokuPuzzles){
                var sudoku = sudokuPuzzles.userPuzzles[req.session.puzzleInt];
                req.session.puzzleInt = null;
                res.json(sudoku);
            }
        });
    }
    else{
        //send a new puzzle
        var newSudoku = sudoku();
        res.json(newSudoku);
    }
});

//delete this     
router.post('/sudokuObject', (req,res) =>{ 
    if (!req.body) return res.sendStatus(400);
    res.end();
});

router.post('/saveSudoku', (req, res) =>{
    if (!req.body) return res.sendStatus(400);
    if(req.session.user){
        SudokuPuzzles.findOne({userId : req.session.user}, (err, sudokuPuzzles)=>{
            if(err){
                console.log(err);
                return;
            }
            if(sudokuPuzzles){
                var puzzleExists = false;
                var puzzleLocation;
                for(let i = 0; i < sudokuPuzzles.userPuzzles.length; i++){
                    if(sudokuPuzzles.userPuzzles[i].TimeCreated == req.body.TimeCreated){
                        puzzleExists = true;
                        puzzleLocation = i;
                        sudokuPuzzles.userPuzzles[i] = req.body;
                    }
                } 
                if(!puzzleExists){
                    sudokuPuzzles.userPuzzles.push(req.body);
                }
                sudokuPuzzles.update(sudokuPuzzles,(err, raw)=>{
                    if(err){
                        return console.log(err);
                    }
                    console.log('The response from Mongo was ', raw);
                    res.sendStatus(200);
                });
            }
            else{
                sudokuPuzzles = new SudokuPuzzles({
                    userId : req.session.user,
                    userPuzzles : []
                });
                sudokuPuzzles.userPuzzles.push(req.body);
                sudokuPuzzles.save((err)=>{
                    if(err){
                        return console.log(err);
                    }
                    res.sendStatus(200);
                });
            }});
    }
    else{
        req.session.sudoku = req.body;
        console.log(req.session.sudoku);
        res.send({message:"mustLogin"});
    }
});

router.get('/account', (req, res)=>{
    if(!req.session.user){
        return res.redirect('login');
    }
    if(req.session.sudoku){
        console.log('req.session.sudoku');
        SudokuPuzzles.findOne({userId : req.session.user}, (err, sudokuPuzzles)=>{
            if(err){
                console.log(err);
                return;
            }
            if(sudokuPuzzles){
                sudokuPuzzles.userPuzzles.push(req.session.sudoku);
                
                sudokuPuzzles.update(sudokuPuzzles,(err, raw)=>{
                    if(err){
                        return console.log(err);
                    }
                });
            }
            else{
                sudokuPuzzles = new SudokuPuzzles({
                    userId : req.session.user,
                    userPuzzles : []
                });
                sudokuPuzzles.userPuzzles.push(req.session.sudoku);
                sudokuPuzzles.save((err)=>{
                    if(err){
                        return console.log(err);
                    }
                });
            }});
    }
    res.render('account');
});

router.get('/404', (req,res)=>{
    res.render('404');
});

router.get('/500', (req,res)=>{
    res.render('500');
});

router.get('/puzzleList', (req,res)=>{
    if(!req.session.user){
        return res.redirect('/login');
    }
    res.render('puzzleList');
});

router.get('/puzzleData', (req,res)=>{
    SudokuPuzzles.findOne({userId : req.session.user}, (err, sudokuPuzzles)=>{
        if(err){
            console.log(err);
            return;
        }
        if(sudokuPuzzles){
            res.json(sudokuPuzzles);
        }
        else{
            res.render('puzzleList', {message: "noPuzzlesYet"});
        }
    });
});

router.post('/loadPuzzle', (req,res)=>{
    req.session.puzzleInt = req.body.puzzleInt;
    res.send('200');
});

router.post('/deletePuzzle', (req, res) => {
    var puzzleToDelete = req.body.puzzleInt;
    SudokuPuzzles.findOne({ userId: req.session.user }, (err, sudokuPuzzles) => {
        if (err) {
            console.log(err);
            return;
        }
        if (sudokuPuzzles) {
            sudokuPuzzles.userPuzzles.splice(puzzleToDelete, 1);

            sudokuPuzzles.update(sudokuPuzzles, (err, raw) => {
                if (err) {
                    return console.log(err);
                }
                console.log('The response from Mongo was ', raw);
            });
            res.json(sudokuPuzzles);
        }
    });
});

module.exports = router;