/* jshint esversion: 6*/

$( document ).ready(function() {
    setSizes();
    console.log( "ready!" );
    registerUI();
});

function setSizes(){
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;
    $('#wrapper').height(windowHeight);
    $('#wrapper').width(windowWidth);
}

function registerUI(){
    $('#google').on('click', (event, ui)=>{
        window.location.href = 'auth/google';
    });
}