$(document).ready(()=>{
    setSizes();
    window.addEventListener('resize', setSizes, true);
});

function setSizes(){
    var height = window.innerHeight;
    var width = window.innerWidth;
    $('#wrapper').css({
        height :  height,
        width : width
    });
}

function registerUI(){
    $('#login').on('click', (event, ui)=>{

    });
    $('#explore').on('click', (event, ui)=>{

    });

}