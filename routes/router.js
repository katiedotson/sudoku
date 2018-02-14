/* jshint esversion: 6 */

const express = require('express');
const router = express.Router();
var sudoku = require('../models/sudokus.js');
var bodyParser = require('body-parser');

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
    console.log(newSudoku);
    res.json(newSudoku);
});

router.post('/sudokuObject', (req,res) =>{ 
    if (!req.body) return res.sendStatus(400);
    console.log("From browser, Sudoku is: " + req.body);
});

router.get('/404', (req,res)=>{
    res.render('404');
});

router.get('/500', (req,res)=>{
    res.render('500');
});

module.exports = router;