/*jshint esversion: 6*/

//window.location.reload();
$(document).ready(function(){
    setSizes();
    //window.addEventListener('resize', setSizes, true);
    registerUI();
});

function setSizes(){
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;
    $('#wrapper').height(windowHeight);
    $('#wrapper').width(windowWidth);

}

function registerUI(){
    $('#play').on('click', (event, ui)=>{
        window.location.href = '/sudoku';
    });
    $('#puzzleList').on('click', (event, ui)=>{
        window.location.href = '/puzzleList';
    });
    $('#deleteAccount').on('click', (event, ui)=>{

    });

}