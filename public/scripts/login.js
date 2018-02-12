

$(document).ready(function(){
    setSizes();
    //window.location.reload();
    // window.addEventListener('resize', setSizes, true);
});
$( document ).ready(function() {
    console.log( "ready!" );
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