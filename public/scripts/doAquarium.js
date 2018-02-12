/*jshint esversion: 6*/

//window.location.reload();
$(document).ready(function(){
    setSizes();
    //window.addEventListener('resize', setSizes, true);
    //registerUI();
});

function setSizes(){
    alert("called");
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;
    $('#wrapper').height(windowHeight);
    $('#wrapper').width(windowWidth);

}

function registerUI(){
    $('#login').on('click', (event, ui)=>{

    });
    $('#explore').on('click', (event, ui)=>{

    });

}

