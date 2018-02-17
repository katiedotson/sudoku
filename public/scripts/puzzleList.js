/* jshint esversion: 6 */

$(document).ready(function(){
    document.addEventListener('puzzleChosen', function(e){
        puzzleAction(e.detail);
    });
    setSizes();
    registerUI();
    getPuzzles();
});

function getPuzzles(){
    var promise = $.ajax({
        url: '/puzzleData',
        method: 'GET',
        dataType: 'json', 
    });
    promise.done((data)=>{
        var sudokus = data;
        displaySudokus(sudokus);
    });
}

function displaySudokus(sudokus){
    
    for(let i = 0; i < sudokus.userPuzzles.length; i++){
        var colorMode = sudokus.userPuzzles[i].ColorMode;
        var mode;
        if(colorMode){
            mode = "Color Mode";
        }
        else{
            mode = "Number Mode";
        }
        var percentCompleted = (100*(sudokus.userPuzzles[i].NumberCompleted/81)).toFixed(1)+ "% complete";
        var id = "puzzle" + i;
        $("#puzzleList").append('<div id=" ' + id + '" class="puzzle">' + mode + ', ' + percentCompleted + '</div>' );
    }
}

function setSizes(){
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();

    if (windowWidth < 1000) {
        listWidth = windowWidth * 0.98;
        listHeight = windowHeight * 0.6;
    }
    else {
        listHeight = windowHeight * 0.6;
        listWidth = windowWidth * 0.6;
    }

    $("#puzzleList").css("width", listWidth);
    $("#puzzleList").css("height", listHeight);

    $("#puzzleControls").css("width", listWidth);

}

function registerUI(){
    var puzzleInt;
    $("#puzzleList").on("click", ".puzzle", function(event, ui){
        $('#actionModal').show();
        puzzleInt = (this.id.match(/\d+/).shift());
    });
    $("#closeActionModal").on("click", function(event, ui){
        $("#actionModal").hide();
    });
    $("#loadPuzzle").on("click", function(event, ui){
        var puzzleClicked = new CustomEvent('puzzleChosen', {'detail': {'puzzleInt': puzzleInt, 'action': 'loadPuzzle'}});
        document.dispatchEvent(puzzleClicked);
    });
    $("#deletePuzzle").on("click", function(event, ui){
        var puzzleClicked = new CustomEvent('puzzleChosen', {'detail':{'puzzleInt': puzzleInt, 'action': 'deletePuzzle'}});
        document.dispatchEvent(puzzleClicked);
    });
    $("#createNew").on("click", function(event,ui){
        window.location.href = "/sudoku";
    });
}

function puzzleAction(puzzleClicked){
    if(puzzleClicked.action == 'loadPuzzle'){       //load puzzle
        loadPuzzle(puzzleClicked.puzzleInt);
    }
    else{                                           //delete puzzle
        deletePuzzle(puzzleClicked.puzzleInt);
    }
}

function loadPuzzle(puzzleInt){
    var puzzleInfo = {'puzzleInt': puzzleInt};
    var sendThis = JSON.stringify(puzzleInfo);
    console.log(sendThis);
    var promise = $.ajax({
        url: '/loadPuzzle',
        type: 'POST',
        data: sendThis, 
        contentType: 'application/json'
    });
    promise.done((data)=>{
        console.log('promise done');
        window.location.href = '/sudoku';
    });
}

function deletePuzzle(puzzleInt){
    console.log("deleting puzzle " + puzzleInt);
}