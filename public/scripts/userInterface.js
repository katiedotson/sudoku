// import { setTimeout } from "timers";

/* jshint esversion: 6 */


"use strict";
$(document).ready(function(){
    startup();
});

function showLoadModal(){
    $("#loadModal").show();
}

function startup(){
    console.log("startup called");
    var promise = $.getJSON('/sudokuObject', showLoadModal(),  $("spotsToShow").slider("disable")) 
    .done(function(data){
        var Sudoku = data;
        if(Sudoku.HasBeenSaved){
            Sudoku.CurrentValue = null;
            Sudoku.IdOfCurrentValue = "0";
            setSizes();
            setMargins();
            Sudoku = displayPuzzle(Sudoku);
            Sudoku = registerUI(Sudoku);
            $("spotsToShow").slider("enable");
        }
        else{
            setSizes();
            setMargins();
            showAndHideUserInputForCreateNew();
            removeRoundedCornersAndUserInput();
            Sudoku = setUpSettings(Sudoku);
            Sudoku = pickRandomStartingNumbers(Sudoku, Sudoku.NumberToShow);
            Sudoku = populateSpotsForNumberMode(Sudoku);
            Sudoku = registerUI(Sudoku);
            $("spotsToShow").slider("enable");
        }
        hideLoadModal();
    });     
}

function savePuzzle(sudoku){
    console.log(sudoku);
    showSavingPuzzleButton();
    sudoku.HasBeenSaved = true;
    var sudokuToSend = JSON.stringify(sudoku);
    var promise = $.ajax('/saveSudoku', {
        contentType: 'application/json',
        method: 'POST',
        data: sudokuToSend,
        success: function(){
            console.log("success!");
        }
    }).done(function (data){
        console.log("done");
        var res = data;
        if(res.message == 'mustLogin'){
            window.location.href='/login';
        }
        else{
            showPuzzleSaved();
        }
    });
}
//REGISTER UI 
//                      ****EVENTS**** 
function registerUI(sudoku) {
    //SPOTS TO SHOW SLIDER
    $("#spotsToShow").on("slidestop", function (event, ui) {
        sudoku.NumberToShow = $("#spotsToShow").val();
        if (sudoku.NumberShown < sudoku.NumberToShow) {
            var numberToAdd = sudoku.NumberToShow - sudoku.NumberShown;
            sudoku = pickRandomStartingNumbers(sudoku, numberToAdd);
            if (sudoku.ColorMode) {
                sudoku = populateSpotsForColorMode(sudoku);
            }
            else {
                sudoku = populateSpotsForNumberMode(sudoku);
            }
        }
        else if(sudoku.NumberShown > sudoku.NumberToShow){
            var numberToRemove = sudoku.NumberShown - sudoku.NumberToShow;
            sudoku = removeStartingNumbers(sudoku, numberToRemove);
            if(sudoku.ColorMode){
                sudoku = populateSpotsForColorMode(sudoku);
            }
            else{
                sudoku = populateSpotsForNumberMode(sudoku);
            }
        }
        return sudoku;
    });
    //LETS GO 
    $("#play").on("click", function (event, ui) {
        sudoku.Playing = true;
        showAndHideUserInputForLetsGo(sudoku);
        return sudoku;
    });
    //CREATE NEW 
    $("#createNew").on("click", function (event, ui) {
        window.location.href = '/sudoku';
    });
    //PUZZLE DIV
    $(".puzzle div").on("click", function (event, ui) {
        if (sudoku.Playing) { //only react if user is playing
            var id = this.id; //get the id of the spot they picked
            if (!sudoku.HardMode) {
                sudoku = easyModeActionForPuzzleDiv(sudoku, id);
            }
            else { //puzzle div selected for hard mode
                sudoku = hardModeActionForPuzzleDiv(sudoku, id);
            }
        }
        return sudoku;
    });
    //VALUE BOXES
    $(".valueBox").on("click", function (event, ui) {
        if (sudoku.Playing) {
            //get the id of what value they chose                  
            var idOfSelectedValue = event.target.id;
            if (idOfSelectedValue == "") {
                idOfSelectedValue = event.target.parentNode.id;
            }
            //only react if the user selected a different value
            if (idOfSelectedValue !== sudoku.IdOfCurrentValue) {
                if (!sudoku.HardMode) { //easy mode
                    sudoku = easyModeActionForValueBox(sudoku, idOfSelectedValue);
                }
                else if (sudoku.NotesMode) { //NotesMode is true
                    sudoku = notesModeActionForValueBox(sudoku, idOfSelectedValue);
                }
                else { //value box selected for HardMode
                    sudoku = hardModeActionForValueBox(sudoku, idOfSelectedValue);
                }
            }
        }
        return sudoku;
    });
    //CREATE NOTES 
    $("#createNotes").on("click", function (event, ui) {
        if (sudoku.Playing) {
            sudoku.NotesMode = true;

            //exit Oops
            $("#oops").show();
            $("#exitOops").hide();
            sudoku.OopsMode = false;

            $("#exitNotes").show();
            $("#createNotes").hide();
            highlightValueBox(sudoku, sudoku.IdOfCurrentValue);
            return sudoku;
        }
    });
    //EXIT NOTES
    $("#exitNotes").on("click", function (event, ui) {
        sudoku.NotesMode = false;
        $("#exitNotes").hide();
        $("#createNotes").show();
        highlightValueBox(sudoku, sudoku.IdOfCurrentValue);
        return sudoku;
    });
    //OOPS
    $("#oops").on("click", function (event, ui) {
        if (sudoku.Playing) {
            //exit Notes Mode
            sudoku.NotesMode = false;
            $("#exitNotes").hide();
            $("#createNotes").show();

            sudoku.OopsMode = true;
            $("#oops").hide();
            $("#exitOops").show();

            highlightValueBox(sudoku, sudoku.IdOfCurrentValue);
            return sudoku;
        }
    });
    //EXIT OOPS
    $("#exitOops").on("click", function (event, ui) {
        $("#oops").show();
        $("#exitOops").hide();
        sudoku.OopsMode = false;
        sudoku.NotesMode = false;
        return sudoku;
    });
    //COLOR MODE SELECTED
    $("#colorMode").on("change", function (event, ui) {
        if (sudoku.ColorMode) {
            sudoku.ColorMode = false;
            sudoku = populateSpotsForNumberMode(sudoku);
        }
        else {
            sudoku.ColorMode = true;
            sudoku = populateSpotsForColorMode(sudoku);
        }
        return sudoku;
    });
    //HARD MODE SELECTED
    $("#hardMode").on("change", function (event, ui) {
        if (sudoku.HardMode) {
            sudoku.HardMode = false;
        }
        else {
            sudoku.HardMode = true;
        }
        return sudoku;
    });
    //HINT
    $("#hint").on("click", function (event, ui) {
        if (sudoku.Playing) {
            sudoku = giveAHint(sudoku);
            return sudoku;
        }
    });
    //HELP
    $("#help").on("click", function (event, ui) {
        if (sudoku.HardMode && sudoku.ColorMode) {
            $("#hardModeColorMode").show();
        }
        else if (sudoku.HardMode) { //hard mode & number
            $("#hardModeNumberMode").show();
        }
        else if (sudoku.ColorMode) { //color mode & easy
            $("#easyModeColorMode").show();
        }
        else { //number mode & easy
            $("#easyModeNumberMode").show();
        }
        $(".helpfulness").fadeIn();
    });
    //EXIT HELP
    $("#exitHelpModal").on("click", function (event, ui) {
        $(".helpText").hide();
        $("#exitHelpModal").hide();
        $(".helpfulness").fadeOut();
    });
    $("#exitFinishedModal").on("click", function (event, ui) {
        $("#puzzleFinishedModal").hide();
        $("#finishedPuzzleText").html("");
        $(".helpText").hide();
    });
    $("#savePuzzle").on("click", function(event, ui){
        savePuzzle(sudoku);
    });
    $("#puzzleList").on("click", function(event, ui){
        window.location.href = "puzzleList";
    });
    $("#menuIcon").on("click", function(event,ui){
        $("#spotsToShow").slider("disable");
        $("#menu").show();
    });
    $("#exitMenu").on("click", function(event,ui){

        $("#menu").hide();
        $("#spotsToShow").slider("enable");
    });
}


//UI FUNCTIONS //functions that change the interface                   */       
//----SET SIZES: set puzzle size and spots according to window size
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

    $("#userInput").css("width", puzzleWidth);
    $(".valueBox").css("width", spotWidth * .9);

    $("#settings").css("width", puzzleWidth);

    $("#helpModal").css("width", windowWidth);
    $("#helpModal").css("height", $("body").height());
}
//----SET MARGINS : of puzzle to show more helpful grid 
function setMargins() {
    var currentId = 0;
    for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
            currentId++;
            if (row == 0) {
                $("#" + currentId).css({ "margin-top": "0px" });
            }
            else if (row == 3 || row == 6) {
                $("#" + currentId).css({ "margin-top": "4px" });
            }
            else {
                $("#" + currentId).css({ "margin-top": "1px" });
            }

            if (column == 0) {
                $("#" + currentId).css({ "margin-left": "0px" });
            }
            else if (column == 3 || column == 6) {
                $("#" + currentId).css({ "margin-left": "4px" });
            }
            else {
                $("#" + currentId).css({ "margin-left": "1px" });
            }
        }
    }
}
//----SET UP SETTINGS for slider, flipswitches, etc.
function setUpSettings(sudoku) {
    sudoku.Playing = false;
    sudoku.ColorMode = false;
    $("#hardMode").prop("checked", false);
    $("#colorMode").prop("checked", false);
    $("#colorMode").flipswitch("refresh");
    $("#hardMode").flipswitch("refresh");

    $("#spotsToShow").slider({
        value: sudoku.NumberToShow,
        min: 17,
        max: 52
    });
    $("#spotsToShow").val("17").slider("refresh");
    return sudoku;
}
//----POPULATE SPOTS: show values for the puzzle
function populateSpotsForNumberMode(sudoku) {
    console.log('NUMBER MODE CALLED');
    console.log(sudoku);
    $('.spot').animate({ "backgroundColor": "white" }, { "duration": "fast" });
    var currentId = 0;
    for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
            currentId++;
            // $("#" + currentId).animate({ "backgroundColor": "white" }, { "duration": "fast" });
            var thisSpot = sudoku.Array[row][column];
            if(thisSpot.IsUsedAtBeginning){                                          //spots that were used at beginning (without added user input)
                // console.log('1 spot');
                $("#" + currentId).html(thisSpot.Value);
                $("#" + currentId).css({ "color": "black" });
            }
            else if(thisSpot.UserInput != null){                                            //hinted spots or spots with user input
                // console.log('not used at beginning');
                if(thisSpot.WasHinted){                                                         //hinted spots
                    $("#"+currentId).html(thisSpot.Value);
                    $("#"+currentId).css({"color":"green"});
                }
                else{                                                                           //spots with user input
                    $("#"+currentId).html(thisSpot.UserInput);
                    if(sudoku.HardMode){
                        $("#"+currentId).css("color", "red");
                    }
                    else{
                        $("#"+currentId).css("color", "black");
                    }
                }
            }
            else{                                                                           //no user input, hints, or starting values                                                
                if(thisSpot.UserNotes.length > 0){                                               //check if there are notes
                    for(let i = 0; i < thisSpot.UserNotes.length; i++){
                        showNotes(sudoku,i, thisSpot);
                    }
                }
                else{                                                                          //otherwise, there isn't anything there
                // console.log('empty spot');    
                    $("#" + currentId).html("");
                    $("#" + currentId).css({ "color": "black" });
                }
            }
        }
    }
    return sudoku;
}
//----POPULATE SPOTS FOR COLOR MODE
function populateSpotsForColorMode(sudoku) {
    console.log('COLOR MODE CALLED');
    console.log(sudoku);
    var currentId = 0;
    for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
            currentId++;
            var thisSpot = sudoku.Array[row][column];
            if(thisSpot.IsUsedAtBeginning){     //spots used without user input
                console.log("this spot is used at beginning");
                var value = sudoku.Array[row][column].Value;
                var color = getColor(sudoku, value);
                $("#" + currentId).html("");
                $("#" + currentId).css({ "background-color": color, "transition": "background-color 500ms" });
            }
            else if(thisSpot.UserInput != null){                                                                        //spots with added user input or hinted
                if(thisSpot.WasHinted){                                                                                     //spots that were hinted
                    var color = getColor(sudoku, thisSpot.Value);
                    $("#" + currentId).css({ "background-color": color, "transition": "background-color 500ms" });
                    $("#" + currentId).html('<i class="material-icons">stars</i>');
                }
                else{                                                                                                       //spots with user-added input
                    var color = getColor(sudoku, thisSpot.UserInput);
                    $("#" + currentId).css({ "background-color": color, "transition": "background-color 500ms" });
                    $("#" + currentId).html('<i class="material-icons">grain</i>');
                }
            }
            else{                                                                                                           //no user input, hints, or starting values 
                if(thisSpot.UserNotes.length > 0){                                                                              //check if there are notes
                    for(let i = 0; i < thisSpot.UserNotes.length; i++){
                        showNotes(sudoku,i, thisSpot);
                    }        //show user notes
                }
                else{                                                                                                       //if there isn't anything there
                    $("#" + currentId).css({ "background-color": "white", "transition": "background-color 500ms" });
                    $("#"+ currentId).html("");
                }                                   
            }
        }
    }
    return sudoku;
}
//----HIGHLIGHT IN PUZZLE : based on current value
function highlightInPuzzle(sudoku) {
    for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
            var spot = sudoku.Array[row][column];
            
            if (!sudoku.HardMode) {
                if ((spot.Value == sudoku.CurrentValue && spot.IsUsedAtBeginning) || spot.IsCompleted && spot.Value == sudoku.CurrentValue) {
                   
                    var idOfCurrentValue = spot.Id;
                    if (sudoku.ColorMode) {
                        $("#" + idOfCurrentValue).css({ "border-radius": "50px", "transition": "border-radius 500ms" });
                    }
                    else {
                        $("#" + idOfCurrentValue).animate({ "backgroundColor": sudoku.HighlightColor }, { "duration": "slow" });
                    }
                }
            }
            else {
                if ((spot.Value == sudoku.CurrentValue && spot.IsUsedAtBeginning) || spot.UserInput == sudoku.CurrentValue) {
                    // console.log(spot);
                    var idOfCurrentValue = spot.Id;
                    if (sudoku.ColorMode) {
                        $("#" + idOfCurrentValue).css({ "border-radius": "50px", "transition": "border-radius 500ms" });
                    }
                    else {
                        $("#" + idOfCurrentValue).animate({ "backgroundColor": sudoku.HighlightColor }, { "duration": "slow" });
                    }
                }
            }
        }
    }
}
//----UNHIGHLIGHT IN PUZZLE : based on current value (use before it is changed in #userInput event)
function unhighlightInPuzzle(sudoku) {
    for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
            var spot = sudoku.Array[row][column];
            if (((spot.Value == sudoku.CurrentValue) && (spot.IsUsedAtBeginning)) || (spot.UserInput == sudoku.CurrentValue)) {
                var idOfCurrentValue = spot.Id;
                if (sudoku.ColorMode) {
                    $("#" + idOfCurrentValue).css({ "border-radius": "0px", "transition": "border-radius 500ms" });
                }
                else {
                    $("#" + idOfCurrentValue).animate({ "backgroundColor": "white" }, { "duration": "slow" });
                }
            }
        }
    }
}
//----HIGHLIGHT VALUE BOX
function highlightValueBox(sudoku, selectedValue) {
    var completed = checkIfValueCompleted(sudoku, sudoku.CurrentValue);
    if (!completed) {
        if (sudoku.ColorMode) {
            $("#" + selectedValue).css({ "border-radius": "50px", "transition": "border-radius 500ms" });
            if (sudoku.NotesMode) {
                $("#" + selectedValue).html('<i class="material-icons">create</i>');
            }
            else {
                $("#" + selectedValue).html("");
                $("#" + selectedValue).css({ "border": "1px solid" });
            }
        }
        else {
            $("#" + selectedValue).animate({ backgroundColor: sudoku.HighlightColor }, { duration: "slow" });
        }
    }
    else {
        if (sudoku.ColorMode) {
            $("#" + selectedValue).css({ "border-radius": "50px", "transition": "border-radius 500ms" });
            if (sudoku.NotesMode) {
                $("#" + selectedValue).html('<i class="material-icons">done</i>');
            }
        }
        else {
            $("#" + selectedValue).animate({ backgroundColor: sudoku.CompletedColor }, { duration: "slow" });
        }
    }
}
//----UNHIGHLIGHT VALUE BOX
function unhighlightValueBox(sudoku, currentValue) {
    var completed = checkIfValueCompleted(sudoku, sudoku.CurrentValue);
    if (!completed) {
        if (sudoku.ColorMode) {
            $("#" + currentValue).css({ "border-radius": "5px", "transition": "border-radius 500ms" });
            $("#" + currentValue).html("");
        }
        else {
            $("#" + currentValue).animate({ backgroundColor: "transparent" }, { duration: "slow" });
        }
    }
    else {
        if (sudoku.ColorMode) {
            $("#" + currentValue).html('<i class="material-icons">done</i>');
            $("#" + currentValue).css({ "border-radius": "5px", "transition": "border-radius 500ms" });
        }
        else {
            $("#" + currentValue).animate({ backgroundColor: sudoku.CompletedColor }, { duration: "slow" });
        }
    }
}
//----REMOVE ROUNDED CORNERS AND USER INPUT
function removeRoundedCornersAndUserInput() {
    var id = 0;
    for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
            id++;
            $("#" + id).css({ "border-radius": "" });
            $("#" + id).html("");
            $("#" + id).css("background-color", "white");
        }
    }
    id = 0;
    for (let r = 0; r < 10; r++) {
        id++;
        $("#value" + id).css({ "border-radius": "" });
    }
}
//----REMOVE ROUNDED CORNERS
function removeRoundedCorners() {
    var id = 0;
    for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
            id++;
            $("#" + id).css({ "border-radius": "" });
        }
    }
}
//----SHAKE PUZZLE
function shakePuzzle() {
    var div = $(".puzzle");
    div.animate({ left: '-=30px' }, { duration: 150, easing: "swing" });
    div.animate({ left: '+=70px' }, { duration: 150, easing: "swing" });
    div.animate({ left: '-=40px' }, { duration: 100, easing: "swing" });
}
//----MAKE VALUE BOXES NUMBERS
function makeValueBoxesNumbers(sudoku) {
    for (let i = 0; i < 9; i++) {
        var isValueCompleted = checkIfValueCompleted(sudoku, i);
        if(isValueCompleted){
            $("#value" + i).css({ "background-color": sudoku.CompletedColor});
        }
        else{
            $("#value" + i).css({ "background-color": "transparent" });
        }
        $("#value" + i).html(i);
    }
}
//----FINISH PUZZLE
function finishPuzzle(sudoku) {
    removeRoundedCorners();
    displayFinishedPuzzleModal(sudoku);
    sudoku.BoxesClicked = 0;
    sudoku.Playing = false;
    return sudoku;
}
//----FINISH PUZZLE FOR HARD MODE
function finishPuzzleForHardMode(sudoku) {
    sudoku.Playing = false;
    removeRoundedCorners();
    displayFinishedPuzzleModal(sudoku);
    return sudoku;
}
//----VALUE COMPLETED IN COLOR MODE
function valueCompletedForColorMode(sudoku, id) {
    $("#value" + sudoku.CurrentValue).html('<i class="material-icons">done</i>');
}
//----SHOW COLORMODE VALUE BOXES
function showColorModeValueBoxes(sudoku) {
    for (let u = 1; u < 10; u++) {
        var color = getColor(sudoku, u);
        $("#value" + u).css({ "backgroundColor": color });
        var completed = checkIfValueCompleted(sudoku, u);
        if(completed){
            $("#value" + u).html('<i class="material-icons">done</i>');
        }
        else{
            $("#value" + u).html("");
        }
    }
}
//----SHOW AND HIDE USER INPUT FOR LET'S GO
function showAndHideUserInputForLetsGo(sudoku) {
    $("#settings").hide();
    $(".valueBox").fadeIn();
    if(sudoku.ColorMode){
        showColorModeValueBoxes(sudoku);
    }
    else{
        makeValueBoxesNumbers(sudoku);
    }
    if (sudoku.HardMode) {
        $("#controls").fadeIn("slow");
        $("#createNotes").show();
        $("#oops").show();
        $("#hint").show();
        if(sudoku.Hints == 2){
            $("#hint").html("hint??");
        }
        else if(sudoku.Hints == 1){
            $("#hint").html("hint?");
        }
        else if(sudoku.Hints == 0){
            $("#hint").html("//");
        }
    }
    else {
        $("#controls").fadeIn("slow");
        $("#createNotes").hide();
        $("#hint").hide();
        $("#oops").hide();
    }
    $("#help").fadeIn("slow");
    $("#createNew").fadeIn("slow");
    $("#savePuzzle").show();
    $("#puzzleSaved").hide();
    $("#savingPuzzle").hide();
}
//----SHOW AND HIDE USER INPUT FOR CREATE NEW
function showAndHideUserInputForCreateNew() {
    $("#hint").html("hint???");
    $("#controls").hide();
    $(".valueBox").hide();
    $("#settings").fadeIn("slow");
}
//----EASY MODE ACTION FOR VALUE BOX
function easyModeActionForValueBox(sudoku, idOfSelectedValue) {

    unhighlightInPuzzle(sudoku);
    unhighlightValueBox(sudoku, sudoku.IdOfCurrentValue);

    sudoku = setCurrentValue(sudoku, idOfSelectedValue);
    highlightValueBox(sudoku, idOfSelectedValue);
    highlightInPuzzle(sudoku);

    return sudoku;
}
//----NOTES MODE ACTION FOR VALUE BOX
function notesModeActionForValueBox(sudoku, idOfSelectedValue) {

    unhighlightInPuzzle(sudoku);
    unhighlightValueBox(sudoku, sudoku.IdOfCurrentValue);

    sudoku = setCurrentValue(sudoku, idOfSelectedValue);

    highlightValueBox(sudoku, idOfSelectedValue);
    highlightInPuzzle(sudoku);

    return sudoku;
}
//----HARD MODE ACTION FOR VALUE BOX
function hardModeActionForValueBox(sudoku, idOfSelectedValue) {

    unhighlightInPuzzle(sudoku);
    unhighlightValueBox(sudoku, sudoku.IdOfCurrentValue);

    sudoku = setCurrentValue(sudoku, idOfSelectedValue);

    highlightValueBox(sudoku, idOfSelectedValue);
    highlightInPuzzle(sudoku);

    return sudoku;
}
//----EASY MODE ACTION FOR PUZZLE DIV
function easyModeActionForPuzzleDiv(sudoku, id) {
    if (sudoku.Playing) {
        var decision = decideWhetherToShowValueInSpot(sudoku, id);
        if (decision) {
            sudoku = addUserInputToSudokuArray(sudoku, id);
            displayUserInputSudokuForEasyMode(sudoku, id);
            sudoku.NumberCompleted++;
        }
        else {
            shakePuzzle();
            sudoku.IncorrectInput++;
        }
        sudoku.BoxesClicked++;

        var completed = checkIfValueCompleted(sudoku, sudoku.CurrentValue);
        if (completed) {
            if (sudoku.ColorMode) {
                valueCompletedForColorMode(sudoku, id);
            }
            else {
                $("#value" + sudoku.CurrentValue).animate({ "backgroundColor": sudoku.CompletedColor }, { "duration": "slow" });
            }
        }
        if (sudoku.NumberCompleted == 81) {
            sudoku = finishPuzzle(sudoku);
        }
    }
    return sudoku;
}
//----HARD MODE ACTION FOR PUZZLE DIV
function hardModeActionForPuzzleDiv(sudoku, id) {
    if (sudoku.Playing) {
        if (sudoku.NotesMode) {
            sudoku = addUserNoteToSpot(sudoku, id, sudoku.CurrentValue);
        }
        else if (sudoku.OopsMode) {
            sudoku = removeUserInput(sudoku, id);
        }
        else {
            sudoku = addUserInputForHardMode(sudoku, id);
        }
        return sudoku;
    }
}
//----ADD USER INPUT FOR HARD MODE AND COLOR
function addUserInputForHardModeAndColor(sudoku, id, currentValue) {
    var color = getColor(sudoku, currentValue);
    $("#" + id).css({ "background-color": color, "transition": "background-color 500ms" });
    $("#" + id).html('<i class="material-icons">grain</i>');
    $("#" + id).css({ "border-radius": "50px", "transition": "border-radius 500ms" });
}
//----ADD USER INPUT FOR HARD MODE AND NUMBER
function addUserInputForHardModeAndNumber(sudoku, id, currentValue) {
    $("#" + id).html(currentValue).css("color", "red");
    $("#" + id).animate({ "backgroundColor": sudoku.HighlightColor }, { "duration": "slow" });
}
//----REMOVE USER INPUT
function removeUserInput(sudoku, id) {
    var spot = getSpotById(sudoku, id);
    var valueCompleted = checkIfValueCompleted(sudoku, spot.Value);
    if (!spot.IsUsedAtBeginning && !valueCompleted) {
        if(spot.Value == spot.UserInput){
            sudoku.NumberCompleted--;
        }
        spot.UserInput = null;
        spot.IsCompleted = false;
        sudoku.Array[spot.Row][spot.Column] = spot;
        if (sudoku.ColorMode) {
            $("#" + id).css({ "background-color": "white", "transition": "background-color 500ms" })
                .css({ "border-radius": "0px", "transition": "border-radius 500ms" })
                .html("");
        }
        else {
            $("#" + id).html("");
            $("#" + id).animate({ backgroundColor: "white" }, { duration: "slow" });
        }
    }
    else {
        shakePuzzle();
    }
    if (spot.UserNotes.length > 0 && spot.Value != spot.UserInput) {
        for (let i = 0; i < spot.UserNotes.length; i++) {
            showNotes(sudoku, i, spot);
        }
    }
    return sudoku;
}
//----ADD USER INPUT FOR HARD MODE
function addUserInputForHardMode(sudoku, id) {
    var spot = getSpotById(sudoku, id);
    var isValueCompleted = checkIfValueCompleted(sudoku, spot.Value);
    if (!spot.IsUsedAtBeginning && sudoku.CurrentValue !== null && !isValueCompleted) { 
        $("#" + id).html(""); //empty the spot of user notes/previous colors
        if (sudoku.ColorMode) {
            addUserInputForHardModeAndColor(sudoku, id, sudoku.CurrentValue);
        }
        else {
            addUserInputForHardModeAndNumber(sudoku, id, sudoku.CurrentValue);
        }
        spot.UserInput = sudoku.CurrentValue;
        if (spot.UserInput == spot.Value) {
            spot.IsCompleted = true;
            sudoku.NumberCompleted++;
            if(sudoku.NumberCompleted == 81){
                finishPuzzleForHardMode(sudoku);
            }
        }
        sudoku.Array[spot.Row][spot.Column] = spot;

        var completed = checkIfValueCompleted(sudoku, sudoku.CurrentValue);
        if (completed) {
            if (sudoku.ColorMode) {
                valueCompletedForColorMode(sudoku, id);
            }
            else {
                $("#value" + sudoku.CurrentValue).animate({ "backgroundColor": sudoku.CompletedColor }, { "duration": "slow" });
            }
        }
    }
    return sudoku;
}
//----ADD USER NOTE TO SPOT
function addUserNoteToSpot(sudoku, id, userValue) {
    var spotClicked = getSpotById(sudoku, id);
    console.log(spotClicked);
    var noteAlreadyAdded = false;
    if (!spotClicked.IsUsedAtBeginning && !spotClicked.IsCompleted) {
        for (let i = 0; i < 4; i++) {
            if (spotClicked.UserNotes[i] == userValue) {
                noteAlreadyAdded = true;
            }
        }
        console.log(noteAlreadyAdded);
        if (!noteAlreadyAdded && spotClicked.UserNotes.length != 4) {
            spotClicked.UserNotes.push(userValue);
            console.log(spotClicked);
            sudoku.Array[spotClicked.Row][spotClicked.Column] = spotClicked;

            var beginDiv = '<div class="userNote" ';
            var idString = 'id = "' + spotClicked.Id + 'userNoteFor' + userValue + '"';
            var endDiv = '></div>';

            if (sudoku.ColorMode) {
                var color = getColor(sudoku, userValue);
                $("#" + spotClicked.Id).append(beginDiv + idString + endDiv);
                $("#" + spotClicked.Id + 'userNoteFor' + userValue).css({ "background-color": color, "transition": "background-color 500ms" });
            }
            else {
                $("#" + spotClicked.Id).append(beginDiv + idString + endDiv);
                $("#" + spotClicked.Id + 'userNoteFor' + userValue).html(userValue).css("color", "blue");
            }
            $(".userNote").show();
        }
        else {
            shakePuzzle();
        }
    }
    else {
        shakePuzzle();
    }
    return sudoku;
}
//----ADD USER NOTE TO SPOT AFTER OOPS
function showNotes(sudoku, i, spot) {
    var userValue = spot.UserNotes[i];

    var beginDiv = '<div class="userNote" ';
    var idString = 'id = "' + spot.Id + 'userNoteFor' + userValue + '"';
    var endDiv = '></div>';

    if (sudoku.ColorMode) {
        var color = getColor(sudoku, userValue);
        $("#" + spot.Id).append(beginDiv + idString + endDiv);
        $("#" + spot.Id + 'userNoteFor' + userValue).css({ "background-color": color, "transition": "background-color 500ms" });
    }
    else {
        $("#" + spot.Id).append(beginDiv + idString + endDiv);
        $("#" + spot.Id + 'userNoteFor' + userValue).html(userValue).css("color", "blue");
    }
}
//----DISPLAY USER INPUT IN SUDOKU ARRAY FOR EASY MODE
function displayUserInputSudokuForEasyMode(sudoku, id) {
    if (sudoku.ColorMode) {
        var color = getColor(sudoku, sudoku.CurrentValue);
        $("#" + id).animate({ backgroundColor: color }, { duration: "slow" });
        $("#" + id).css({ "border-radius": "50px", "transition": "border-radius 500ms" });
    }
    else {
        var spot = getSpotById(sudoku, id);
        $("#" + id).html(spot.Value);
        $("#" + id).animate({ "backgroundColor": sudoku.HighlightColor }, { "duration": "slow" });
    }
}
//----SHOW HINT
function showHint(sudoku, spotToShow) {
    if (sudoku.ColorMode) {
        var color = getColor(sudoku, spotToShow.Value);
        $("#" + spotToShow.Id).css("background-color", color);
        $("#" + spotToShow.Id).html('<i class="material-icons">stars</i>');
        if (sudoku.CurrentValue == spotToShow.Value) {
            $("#" + spotToShow.Id).css({ "border-radius": "50px", "transition": "border-radius 500ms" });
        }
    }
    else {
        $("#" + spotToShow.Id).css("color", "green");
        $("#" + spotToShow.Id).html(spotToShow.Value);
        if (sudoku.CurrentValue == spotToShow.Value) {
            $("#" + spotToShow.Id).animate({ "backgroundColor": sudoku.HighlightColor }, { "duration": "slow" });
        }
    }
    if (sudoku.Hints == 2) {
        $("#hint").html("hint??");
    }
    else if (sudoku.Hints == 1) {
        $("#hint").html("hint?");
    }
    else {
        $("#hint").html("//");
    }
}
//DISPLAY FINISHED PUZZLE MODAL
function displayFinishedPuzzleModal(sudoku) {
    $(".helpText").show();
    $("#puzzleFinishedModal").show();
    if (!sudoku.HardMode) {
        $("#finishedPuzzleText").html('Great job! You clicked on ' + sudoku.BoxesClicked + " boxes; Only " + sudoku.IncorrectInput + " of them were wrong.");
    }
    else {
        $("#finishedPuzzleText").html('Great job! You finished the puzzle!');
    }
}
//HIDE LOAD MODAL
function hideLoadModal() {
    $("#loadModal").hide();
}
//DISPLAY PUZZLE
function displayPuzzle(sudoku){
    sudoku.Playing = true;
    if(sudoku.ColorMode){
        sudoku = populateSpotsForColorMode(sudoku);
    }
    else{
        sudoku = populateSpotsForNumberMode(sudoku);
    }
    showAndHideUserInputForLetsGo(sudoku);
    return sudoku;
}
//SAVING PUZZLE DISPLAY
function showSavingPuzzleButton(){
    $("#savePuzzle").hide();
    $("#savingPuzzle").show();
}

function showPuzzleSaved(){
    $("#puzzleSaved").show();
    $("#savingPuzzle").hide();
    var puzzleSaved = setTimeout(hidePuzzleSaved, 4000);
}

function hidePuzzleSaved(){
    $("#puzzleSaved").hide();
    $("#savePuzzle").show();
}