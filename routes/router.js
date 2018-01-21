/* jshint esversion: 6 */


const express = require('express');
const router = express.Router();
var sudoku = require('../models/sudokus.js');
var bodyParser = require('body-parser');

router.get('/', function(req, res){
    res.render('sudoku');
});

router.get('/sudokuObject', (req, res) =>{
    res.json(sudoku);
});

router.post('/sudokuObject', (req,res) =>{
    if (!req.body) return res.sendStatus(400);
    console.log(req.body);
});

router.get('/404', function(req,res){
    res.render('404');
});

module.exports = router;