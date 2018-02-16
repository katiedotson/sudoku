$(document).ready(function(){
    getPuzzles();
});

function getPuzzles(){
    var promise = $.ajax({
        url: '/puzzleData',
        method: 'GET',
        dataType: 'json', 
    });
    promise.done((data)=>{
        console.log(data);
        
    });
}