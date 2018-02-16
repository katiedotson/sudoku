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
    var newSudoku = sudoku();
    res.json(newSudoku);
});

router.post('/sudokuObject', (req,res) =>{ 
    if (!req.body) return res.sendStatus(400);
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
                for(let i = 0; i < sudokuPuzzles.userPuzzles.length; i++){
                    if(sudokuPuzzles.userPuzzles[i].TimeCreated == req.body.TimeCreated){
                        puzzleExists = true;
                        sudokuPuzzles.userPuzzles[i] = req.body;
                    }
                } 
                if(!puzzleExists){
                    console.log("puzzle didn't exist");
                    sudokuPuzzles.userPuzzles.push(req.body);
                }
                sudokuPuzzles.save((err)=>{
                    if(err){
                        return console.log(err);
                    }
                    return console.log("done");
                }, console.log(sudokuPuzzles));
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
                });
                console.log("check yr database");
            }});
    }
    else{
        res.send({message:"mustLogin"});
    }
});

router.get('/account', (req, res)=>{
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

    //res.send('puzzleList', )
});

router.get('/puzzleData', (req,res)=>{
    console.log('get puzzle data');
    console.log(req.session.user);
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

module.exports = router;