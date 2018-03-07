/* jshint esversion: 6 */

$(document).ready(function () {
    document.addEventListener('puzzleChosen', function (e) {
        puzzleAction(e.detail);
    });
    setSizes();
    registerUI();
    getPuzzles();
});

function getPuzzles() {
    var promise = $.ajax({
        url: '/puzzleData',
        method: 'GET',
        dataType: 'json',
    });
    promise.done((data) => {
        var sudokus = data;
        $("#loadModal").show();
        displaySudokus(sudokus, $("#loadModal").hide());
    });
}

function displaySudokus(sudokus) {

    for (let i = 0; i < sudokus.userPuzzles.length; i++) {
        var colorMode = sudokus.userPuzzles[i].ColorMode;
        var hardMode = sudokus.userPuzzles[i].HardMode;
        var numberOrColorMode;
        var easyOrHardMode;
        if (colorMode) {
            numberOrColorMode = "Color";
        }
        else {
            numberOrColorMode = "Number";
        }
        if (hardMode) {
            easyOrHardMode = "Hard";
        }
        else {
            easyOrHardMode = "Easy";
        }
        var percentCompleted = (100 * (sudokus.userPuzzles[i].NumberCompleted / 81)).toFixed(1) + "%";
        var id = "puzzle" + i;

        var dateCreated = sudokus.userPuzzles[i].TimeCreated;
        var formatDate = moment(dateCreated).format("MMM Do YY");

        $("#puzzleList").append('<div id=" ' + id + '" class="puzzleItem">' + numberOrColorMode + ' / ' + easyOrHardMode + ' / ' + percentCompleted +  '/ ' + formatDate + '</div>');
    }
}

function setSizes() {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    
    var puzzleHeight;
    var puzzleWidth;

    if (windowWidth < 1000) {
        puzzleWidth = windowWidth * 0.98;
        puzzleHeight = puzzleWidth;
    }
    else {
        puzzleHeight = windowHeight * 0.6;
        puzzleWidth = puzzleHeight;
    }


    var spotHeight = puzzleHeight / 9 - 1;
    var spotWidth = spotHeight;


    $(".puzzle").css("width", puzzleWidth);
    $(".puzzle").css("height", puzzleHeight / 9);

    $(".spot").css("width", spotWidth);
    $(".spot").css("height", spotHeight);

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

function registerUI() {
    var puzzleInt;
    $("#puzzleList").on("click", ".puzzleItem", function (event, ui) {
        $('#actionModal').show();
        puzzleInt = (this.id.match(/\d+/).shift());
        var puzzleClicked = new CustomEvent('puzzleChosen', {'detail': {'puzzleInt': puzzleInt, 'action': 'previewPuzzle'}});
        document.dispatchEvent(puzzleClicked);
    });
    $("#closeActionModal").on("click", function (event, ui) {
        $("#actionModal").hide();
    });
    $("#loadPuzzle").on("click", function (event, ui) {
        var puzzleClicked = new CustomEvent('puzzleChosen', { 'detail': { 'puzzleInt': puzzleInt, 'action': 'loadPuzzle' } });
        document.dispatchEvent(puzzleClicked);
    });
    $("#deletePuzzle").on("click", function (event, ui) {
        var puzzleClicked = new CustomEvent('puzzleChosen', { 'detail': { 'puzzleInt': puzzleInt, 'action': 'deletePuzzle' } });
        document.dispatchEvent(puzzleClicked);
    });
    $("#createNew").on("click", function (event, ui) {
        window.location.href = "/sudoku";
    });
}

function puzzleAction(puzzleClicked) {
    if (puzzleClicked.action == 'loadPuzzle') {       //load puzzle
        loadPuzzle(puzzleClicked.puzzleInt);
    }
    else if(puzzleClicked.action == 'previewPuzzle'){   //puzzle preview
        previewPuzzle(puzzleClicked.puzzleInt);
    }
    else {                                           //delete puzzle
        deletePuzzle(puzzleClicked.puzzleInt);
    }
}

function loadPuzzle(puzzleInt) {
    var puzzleInfo = { 'puzzleInt': puzzleInt };
    var sendThis = JSON.stringify(puzzleInfo);
    console.log(sendThis);
    var promise = $.ajax({
        url: '/loadPuzzle',
        type: 'POST',
        data: sendThis,
        contentType: 'application/json'
    });
    promise.done((data) => {
        console.log('promise done');
        window.location.href = '/sudoku';
    });
}

function previewPuzzle(puzzleInt) {
    var puzzleInfo = { 'puzzleInt': puzzleInt };
    var sendThis = JSON.stringify(puzzleInfo);
    console.log(sendThis);
    var promise = $.ajax({
        url: '/sudokuObject',
        type: 'GET',
        data: sendThis,
        contentType: 'application/json'
    });
    promise.done((data) => {
        showPuzzlePreview(data);
    });
}

function deletePuzzle(puzzleInt) {
    $("#loadModal").show();
    $("#actionModal").hide();
    console.log("deleting puzzle " + puzzleInt);
    var puzzleInfo = { 'puzzleInt': puzzleInt };
    var sendThis = JSON.stringify(puzzleInfo);
    console.log(sendThis);
    var promise = $.ajax({
        url: '/deletePuzzle',
        type: 'POST',
        data: sendThis,
        contentType: 'application/json'
    });
    promise.done((data) => {

        console.log(' puzzle deleted promise done');
        console.log(data);
        window.location.href = "/puzzleList";
        // $("#puzzleList").html("");
        // displaySudokus(data);
        
    });
}

function showPuzzlePreview(sudoku){
    
}