// import { setTimeout } from "timers";

/* jshint esversion: 6 */


"use strict";
$(document).ready(function () {
    ui.startup();
});

function showLoadModal() {
    $("#loadModal").show();
}



var ui = {
    Sudoku: {},
    startup: function () {
        var self = this;
        var promise = $.getJSON('/sudokuObject', showLoadModal(), $("spotsToShow").slider("disable"))
            .done(function (data) {
                self.Sudoku = data;
                if (self.Sudoku.HasBeenSaved) {
                    self.Sudoku.CurrentValue = null;
                    self.Sudoku.IdOfCurrentValue = "0";
                    self.setSizes();
                    self.setMargins();
                    self.displayPuzzle();
                    self.registerUI();
                    self.showAndHideUserInputForLetsGo();
                    $("spotsToShow").slider("enable");
                }
                else {
                    self.setSizes();
                    self.setMargins();
                    self.showAndHideUserInputForCreateNew();
                    self.removeRoundedCornersAndUserInput();
                    self.setUpSettings();
                    PuzzleMods.pickRandomStartingNumbers(self.Sudoku, 17);
                    self.populateSpotsForNumberMode();
                    self.registerUI();
                    $("spotsToShow").slider("enable");
                }
                self.hideLoadModal();
            });
    },
    savePuzzle: function () {
        var self = this;
        self.showSavingPuzzleButton();
        self.Sudoku.HasBeenSaved = true;
        var sudokuToSend = JSON.stringify(self.Sudoku);
        var promise = $.ajax('/saveSudoku', {
            contentType: 'application/json',
            method: 'POST',
            data: sudokuToSend,
            success: function () {
                //nothing
            }
        }).done(function (data) {
            var res = data;
            if (res.message == 'mustLogin') {
                window.location.href = '/login';
            }
            else {
                self.showPuzzleSaved();
            }
        });
    },
    registerUI: function () {
        var self = this;
        //SPOTS TO SHOW SLIDER
        $("#spotsToShow").on("slidestop", function (event, ui) {
            self.Sudoku.NumberToShow = $("#spotsToShow").val();
            if (self.Sudoku.NumberShown < self.Sudoku.NumberToShow) {
                var numberToAdd = self.Sudoku.NumberToShow - self.Sudoku.NumberShown;
                self.Sudoku = PuzzleMods.pickRandomStartingNumbers(self.Sudoku, numberToAdd);
                if (self.Sudoku.ColorMode) {
                    self.populateSpotsForColorMode();
                }
                else {
                    self.populateSpotsForNumberMode();
                }
            }
            else if (self.Sudoku.NumberShown > self.Sudoku.NumberToShow) {
                var numberToRemove = self.Sudoku.NumberShown - self.Sudoku.NumberToShow;
                PuzzleMods.removeStartingNumbers(self.Sudoku, numberToRemove);
                if (self.Sudoku.ColorMode) {
                    self.populateSpotsForColorMode();
                }
                else {
                    self.populateSpotsForNumberMode();
                }
            }
        });
        //LETS GO 
        $("#play").on("click", function (event, ui) {
            self.Sudoku.Playing = true;
            self.showAndHideUserInputForLetsGo();
        });
        //CREATE NEW 
        $("#createNew").on("click", function (event, ui) {
            window.location.href = '/sudoku';
        });
        //PUZZLE DIV
        $(".puzzle div").on("click", function (event, ui) {
            if (self.Sudoku.Playing) { //only react if user is playing
                var id = this.id; //get the id of the spot they picked
                if (!self.Sudoku.HardMode) {
                    self.easyModeActionForPuzzleDiv(id);
                }
                else { //puzzle div selected for hard mode
                    self.hardModeActionForPuzzleDiv(id);
                }
            }
        });
        //VALUE BOXES
        $(".valueBox").on("click", function (event, ui) {
            if (self.Sudoku.Playing) {
                //get the id of what value they chose                  
                var idOfSelectedValue = event.target.id;
                if (idOfSelectedValue == "") {
                    idOfSelectedValue = event.target.parentNode.id;
                }
                //only react if the user selected a different value
                if (idOfSelectedValue !== self.Sudoku.IdOfCurrentValue) {
                    self.unhighlightInPuzzle();
                    self.unhighlightValueBox();

                    self.Sudoku = PuzzleMods.setCurrentValue(self.Sudoku, idOfSelectedValue);

                    self.highlightValueBox();
                    self.highlightInPuzzle();
                }
            }
        });
        //CREATE NOTES 
        $("#createNotes").on("click", function (event, ui) {
            if (self.Sudoku.Playing) {
                self.Sudoku.NotesMode = true;

                //exit Oops
                $("#oops").show();
                $("#exitOops").hide();
                self.Sudoku.OopsMode = false;

                $("#exitNotes").show();
                $("#createNotes").hide();
                self.highlightValueBox();
            }
        });
        //EXIT NOTES
        $("#exitNotes").on("click", function (event, ui) {
            self.Sudoku.NotesMode = false;
            $("#exitNotes").hide();
            $("#createNotes").show();
            self.highlightValueBox();
        });
        //OOPS
        $("#oops").on("click", function (event, ui) {
            if (self.Sudoku.Playing) {
                //exit Notes Mode
                self.Sudoku.NotesMode = false;
                $("#exitNotes").hide();
                $("#createNotes").show();

                self.Sudoku.OopsMode = true;
                $("#oops").hide();
                $("#exitOops").show();

                self.highlightValueBox();
            }
        });
        //EXIT OOPS
        $("#exitOops").on("click", function (event, ui) {
            $("#oops").show();
            $("#exitOops").hide();
            self.Sudoku.OopsMode = false;
            self.Sudoku.NotesMode = false;
        });
        //COLOR MODE SELECTED
        $("#colorMode").on("change", function (event, ui) {
            if (self.Sudoku.ColorMode) {
                self.Sudoku.ColorMode = false;
                self.populateSpotsForNumberMode();
            }
            else {
                self.Sudoku.ColorMode = true;
                self.populateSpotsForColorMode();
            }
        });
        //HARD MODE SELECTED
        $("#hardMode").on("change", function (event, ui) {
            if (self.Sudoku.HardMode) {
                self.Sudoku.HardMode = false;
            }
            else {
                self.Sudoku.HardMode = true;
            }
        });
        //HINT
        $("#hint").on("click", function (event, ui) {
            if (self.Sudoku.Playing && self.Sudoku.Hints > 0) {
                self.updateHintButton();
                self.Sudoku = PuzzleMods.giveAHint(self.Sudoku);
                if (self.Sudoku.ColorMode) {
                    self.populateSpotsForColorMode();
                }
                else {
                    self.populateSpotsForNumberMode();
                }
                if (self.Sudoku.NumberCompleted == 81) {
                    self.finishPuzzle();
                }
            }
            else {
                self.shakePuzzle();
            }
        });
        //HELP
        $("#help").on("click", function (event, ui) {
            if (self.Sudoku.HardMode && self.Sudoku.ColorMode) {
                $("#hardModeColorMode").show();
            }
            else if (self.Sudoku.HardMode) { //hard mode & number
                $("#hardModeNumberMode").show();
            }
            else if (self.Sudoku.ColorMode) { //color mode & easy
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
        $("#savePuzzle").on("click", function (event, ui) {
            self.savePuzzle();
        });
        $("#puzzleList").on("click", function (event, ui) {
            window.location.href = "puzzleList";
        });
        $("#menuIcon").on("click", function (event, ui) {
            $("#spotsToShow").slider("disable");
            $("#menu").show();
        });
        $("#exitMenu").on("click", function (event, ui) {
            $("#menu").hide();
            $("#spotsToShow").slider("enable");
        });
    },
    updateHintButton: function () {
        var self = this;
        var numberOfRemainingHints = self.Sudoku.Hints;
        if (numberOfRemainingHints == 3) {
            $("#hint").html("hint??");
        }
        if (numberOfRemainingHints == 2) {
            $("#hint").html("hint?");
        }
        if (numberOfRemainingHints == 1) {
            $("#hint").html("//");
        }
    },
    setSizes: function () {
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
    },
    setMargins: function () {
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
    },
    setUpSettings: function () {
        var self = this;
        self.Sudoku.Playing = false;
        self.Sudoku.ColorMode = false;
        $("#hardMode").prop("checked", false);
        $("#colorMode").prop("checked", false);
        $("#colorMode").flipswitch("refresh");
        $("#hardMode").flipswitch("refresh");
        $("#spotsToShow").slider({
            value: self.Sudoku.NumberToShow,
            min: 17,
            max: 52
        });
        $("#spotsToShow").val("17").slider("refresh");
    },
    populateSpotsForNumberMode: function () {
        var self = this;
        $('.spot').animate({ "backgroundColor": "white" }, { "duration": "fast" });
        var currentId = 0;
        for (let row = 0; row < 9; row++) {
            for (let column = 0; column < 9; column++) {
                currentId++;
                var thisSpot = self.Sudoku.Array[row][column];
                if (thisSpot.IsUsedAtBeginning) {                                          //spots that were used at beginning (without added user input)
                    $("#" + currentId).html(thisSpot.Value);
                    $("#" + currentId).css({ "color": "black" });
                }
                else if (thisSpot.UserInput != null) {                                            //hinted spots or spots with user input
                    if (thisSpot.WasHinted) {                                                         //hinted spots
                        $("#" + currentId).html(thisSpot.Value);
                        $("#" + currentId).css({ "color": "green" });
                    }
                    else {                                                                           //spots with user input
                        $("#" + currentId).html(thisSpot.UserInput);
                        if (self.Sudoku.HardMode) {
                            $("#" + currentId).css("color", "red");
                        }
                        else {
                            $("#" + currentId).css("color", "black");
                        }
                    }
                }
                else if (thisSpot.UserNotes.length > 0) {                                               //check if there are notes
                    for (let i = 0; i < thisSpot.UserNotes.length; i++) {
                        self.showNotes(i, thisSpot);
                    }
                }
                else {                                                                          //otherwise, there isn't anything there
                    $("#" + currentId).html("");
                    $("#" + currentId).css({ "color": "black" });
                }
            }
        }
    },
    populateSpotsForColorMode: function () {
        var self = this;
        var currentId = 0;
        for (let row = 0; row < 9; row++) {
            for (let column = 0; column < 9; column++) {
                currentId++;
                var thisSpot = self.Sudoku.Array[row][column];
                if (thisSpot.IsUsedAtBeginning) {                                                                               //spots used without user input
                    var value = self.Sudoku.Array[row][column].Value;
                    var color = PuzzleMods.getColor(self.Sudoku, value);
                    $("#" + currentId).html("");
                    $("#" + currentId).css({ "background-color": color, "transition": "background-color 500ms" });
                }
                else if (thisSpot.UserInput != null) {
                    var color = PuzzleMods.getColor(self.Sudoku, thisSpot.Value);
                    $("#" + currentId).css({ "background-color": color, "transition": "background-color 500ms" });
                    if (thisSpot.WasHinted) {                                                                                     //spots that were hinted
                        $("#" + currentId).html('<i class="material-icons">stars</i>');
                    }
                    else {                                                                                                       //spots with user-added input
                        $("#" + currentId).html('<i class="material-icons">grain</i>');
                    }
                }
                else {                                                                                                           //no user input, hints, or starting values 
                    if (thisSpot.UserNotes.length > 0) {                                                                              //check if there are notes
                        for (let i = 0; i < thisSpot.UserNotes.length; i++) {
                            self.showNotes(i, thisSpot);
                        }
                    }
                    else {                                                                                                       //if there isn't anything there
                        $("#" + currentId).css({ "background-color": "white", "transition": "background-color 500ms" });
                        $("#" + currentId).html("");
                    }
                }
            }
        }
    },
    highlightInPuzzle: function () {
        var self = this;
        for (let row = 0; row < 9; row++) {
            for (let column = 0; column < 9; column++) {
                var spot = self.Sudoku.Array[row][column];
                if (!self.Sudoku.HardMode) {
                    if ((spot.Value == self.Sudoku.CurrentValue && spot.IsUsedAtBeginning) || spot.IsCompleted && spot.Value == self.Sudoku.CurrentValue) {
                        var idOfCurrentValue = spot.Id;
                        if (self.Sudoku.ColorMode) {
                            $("#" + idOfCurrentValue).css({ "border-radius": "50px", "transition": "border-radius 500ms" });
                        }
                        else {
                            $("#" + idOfCurrentValue).animate({ "backgroundColor": self.Sudoku.HighlightColor }, { "duration": "slow" });
                        }
                    }
                }
                else {
                    if ((spot.Value == self.Sudoku.CurrentValue && spot.IsUsedAtBeginning) || spot.UserInput == self.Sudoku.CurrentValue) {
                        var idOfCurrentValue = spot.Id;
                        if (self.Sudoku.ColorMode) {
                            $("#" + idOfCurrentValue).css({ "border-radius": "50px", "transition": "border-radius 500ms" });
                        }
                        else {
                            $("#" + idOfCurrentValue).animate({ "backgroundColor": self.Sudoku.HighlightColor }, { "duration": "slow" });
                        }
                    }
                }
            }
        }
    },
    unhighlightInPuzzle: function () {
        var self = this;
        for (let row = 0; row < 9; row++) {
            for (let column = 0; column < 9; column++) {
                var spot = self.Sudoku.Array[row][column];
                if (((spot.Value == self.Sudoku.CurrentValue) && (spot.IsUsedAtBeginning)) || (spot.UserInput == self.Sudoku.CurrentValue)) {
                    var idOfCurrentValue = spot.Id;
                    console.log('hi');
                    if (self.Sudoku.ColorMode) {
                        $("#" + idOfCurrentValue).css({ "border-radius": "0px", "transition": "border-radius 500ms" });
                    }
                    else {
                        $("#" + idOfCurrentValue).animate({ "backgroundColor": "white" }, { "duration": "slow" });
                    }
                }
            }
        }
    },
    highlightValueBox: function () {
        var self = this;
        var selectedValue = self.Sudoku.CurrentValue;
        var completed = PuzzleMods.checkIfValueCompleted(self.Sudoku, self.Sudoku.CurrentValue);
        if (!completed) {
            if (self.Sudoku.ColorMode) {
                $("#value" + selectedValue).css({ "border-radius": "50px", "transition": "border-radius 500ms" });
                if (self.Sudoku.NotesMode) {
                    $("#value" + selectedValue).html('<i class="material-icons">create</i>');
                }
                else {
                    $("#value" + selectedValue).html("");
                    $("#value" + selectedValue).css({ "border": "1px solid" });
                }
            }
            else {
                $("#value" + selectedValue).animate({ backgroundColor: self.Sudoku.HighlightColor }, { duration: "slow" });
            }
        }
        else {
            if (self.Sudoku.ColorMode) {
                $("#" + selectedValue).css({ "border-radius": "50px", "transition": "border-radius 500ms" });
                if (self.Sudoku.NotesMode) {
                    $("#value" + selectedValue).html('<i class="material-icons">done</i>');
                }
            }
            else {
                $("#value" + selectedValue).animate({ backgroundColor: self.Sudoku.CompletedColor }, { duration: "slow" });
            }
        }
    },
    unhighlightValueBox: function () {
        var self = this;
        var currentValue = self.Sudoku.CurrentValue;
        var completed = PuzzleMods.checkIfValueCompleted(self.Sudoku, self.Sudoku.CurrentValue);
        if (!completed) {
            if (self.Sudoku.ColorMode) {
                $("#value" + currentValue).css({ "border-radius": "5px", "transition": "border-radius 500ms" });
                $("#value" + currentValue).html("");
            }
            else {
                $("#value" + currentValue).animate({ backgroundColor: "transparent" }, { duration: "slow" });
            }
        }
        else {
            if (self.Sudoku.ColorMode) {
                $("#value" + currentValue).html('<i class="material-icons">done</i>');
                $("#value" + currentValue).css({ "border-radius": "5px", "transition": "border-radius 500ms" });
            }
            else {
                $("#value" + currentValue).animate({ backgroundColor: self.Sudoku.CompletedColor }, { duration: "slow" });
            }
        }
    },
    removeRoundedCornersAndUserInput: function () {
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
    },
    removeRoundedCorners: function () {
        var id = 0;
        for (let row = 0; row < 9; row++) {
            for (let column = 0; column < 9; column++) {
                id++;
                $("#" + id).css({ "border-radius": "" });
            }
        }
    },
    shakePuzzle: function () {
        var div = $(".puzzle");
        div.animate({ left: '-=30px' }, { duration: 150, easing: "swing" });
        div.animate({ left: '+=70px' }, { duration: 150, easing: "swing" });
        div.animate({ left: '-=40px' }, { duration: 100, easing: "swing" });
    },
    makeValueBoxesNumbers: function () {
        var self = this;
        for (let i = 0; i < 9; i++) {
            var isValueCompleted = PuzzleMods.checkIfValueCompleted(self.Sudoku, i);
            if (isValueCompleted) {
                $("#value" + i).css({ "background-color": self.Sudoku.CompletedColor });
            }
            else {
                $("#value" + i).css({ "background-color": "transparent" });
            }
            $("#value" + i).html(i);
        }
    },
    finishPuzzle: function () {
        var self = this;
        self.removeRoundedCorners();
        self.displayFinishedPuzzleModal();
        self.Sudoku.BoxesClicked = 0;
        self.Sudoku.Playing = false;
    },
    valueCompletedForColorMode() {
        var self = this;
        $("#value" + self.Sudoku.CurrentValue).html('<i class="material-icons">done</i>');
    },
    showColorModeValueBoxes: function () {
        var self = this;
        for (let u = 1; u < 10; u++) {
            var color = PuzzleMods.getColor(self.Sudoku, u);
            $("#value" + u).css({ "backgroundColor": color });
            var completed = PuzzleMods.checkIfValueCompleted(self.Sudoku, u);
            if (completed) {
                $("#value" + u).html('<i class="material-icons">done</i>');
            }
            else {
                $("#value" + u).html("");
            }
        }
    },
    showAndHideUserInputForLetsGo: function () {
        var self = this;
        $("#settings").hide();
        $(".valueBox").fadeIn();
        if (self.Sudoku.ColorMode) {
            self.showColorModeValueBoxes();
        }
        else {
            self.makeValueBoxesNumbers();
        }
        if (self.Sudoku.HardMode) {
            $("#controls").fadeIn("slow");
            $("#createNotes").show();
            $("#oops").show();
            $("#hint").show();
            if (self.Sudoku.Hints == 2) {
                $("#hint").html("hint??");
            }
            else if (self.Sudoku.Hints == 1) {
                $("#hint").html("hint?");
            }
            else if (self.Sudoku.Hints == 0) {
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
    },
    showAndHideUserInputForCreateNew: function () {
        $("#hint").html("hint???");
        $("#controls").hide();
        $(".valueBox").hide();
        $("#settings").fadeIn("slow");
    },
    easyModeActionForPuzzleDiv(id) {
        var self = this;
        if (self.Sudoku.Playing) {
            var decision = PuzzleMods.decideWhetherToShowValueInSpot(self.Sudoku, id);
            if (decision) {
                self.Sudoku = PuzzleMods.addUserInputToSudokuArray(self.Sudoku, id);
                self.displayUserInputSudokuForEasyMode(id);
                self.Sudoku.NumberCompleted++;
            }
            else {
                self.shakePuzzle();
                self.Sudoku.IncorrectInput++;
            }
            self.Sudoku.BoxesClicked++;

            var completed = PuzzleMods.checkIfValueCompleted(self.Sudoku, self.Sudoku.CurrentValue);
            if (completed) {
                if (self.Sudoku.ColorMode) {
                    self.valueCompletedForColorMode();
                }
                else {
                    $("#value" + self.Sudoku.CurrentValue).animate({ "backgroundColor": self.Sudoku.CompletedColor }, { "duration": "slow" });
                }
            }
            if (self.Sudoku.NumberCompleted == 81) {
                self.finishPuzzle();
            }
        }
    },
    hardModeActionForPuzzleDiv: function (id) {
        var self = this;
        if (self.Sudoku.Playing) {
            if (self.Sudoku.NotesMode) {
                self.addUserNoteToSpot(id);
            }
            else if (self.Sudoku.OopsMode) {
                self.removeUserInput(id);
            }
            else {
                self.addUserInputForHardMode(id);
            }
        }
    },
    addUserInputForHardModeAndColor(id) {
        var self = this;
        var color = PuzzleMods.getColor(self.Sudoku, self.Sudoku.CurrentValue);
        $("#" + id).css({ "background-color": color, "transition": "background-color 500ms" });
        $("#" + id).html('<i class="material-icons">grain</i>');
        $("#" + id).css({ "border-radius": "50px", "transition": "border-radius 500ms" });
    },
    addUserInputForHardModeAndNumber(id, currentValue) {
        var self = this;
        $("#" + id).html(currentValue).css("color", "red");
        $("#" + id).animate({ "backgroundColor": self.Sudoku.HighlightColor }, { "duration": "slow" });
    },
    removeUserInput: function (id) {
        var self = this;
        var spot = PuzzleMods.getSpotById(self.Sudoku, id);
        var valueCompleted = PuzzleMods.checkIfValueCompleted(self.Sudoku, spot.Value);
        if (!spot.IsUsedAtBeginning && !valueCompleted) {
            if (spot.Value == spot.UserInput) {
                self.Sudoku.NumberCompleted--;
            }
            spot.UserInput = null;
            spot.IsCompleted = false;
            self.Sudoku.Array[spot.Row][spot.Column] = spot;
            if (self.Sudoku.ColorMode) {
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
                self.showNotes(i, spot);
            }
        }
    },
    addUserInputForHardMode: function (id) {
        var self = this;
        var spot = PuzzleMods.getSpotById(self.Sudoku, id);
        var isValueCompleted = PuzzleMods.checkIfValueCompleted(self.Sudoku, spot.Value);
        if (!spot.IsUsedAtBeginning && self.Sudoku.CurrentValue !== null && !isValueCompleted) {
            $("#" + id).html(""); //empty the spot of user notes/previous colors
            if (self.Sudoku.ColorMode) {
                self.addUserInputForHardModeAndColor(id, self.Sudoku.CurrentValue);
            }
            else {
                self.addUserInputForHardModeAndNumber(id, self.Sudoku.CurrentValue);
            }
            spot.UserInput = self.Sudoku.CurrentValue;
            if (spot.UserInput == spot.Value) {
                spot.IsCompleted = true;
                self.Sudoku.NumberCompleted++;
                if (self.Sudoku.NumberCompleted == 81) {
                    self.finishPuzzle();
                }
            }
            self.Sudoku.Array[spot.Row][spot.Column] = spot;

            var completed = PuzzleMods.checkIfValueCompleted(self.Sudoku, self.Sudoku.CurrentValue);
            if (completed) {
                if (self.Sudoku.ColorMode) {
                    self.valueCompletedForColorMode(id);
                }
                else {
                    $("#value" + self.Sudoku.CurrentValue).animate({ "backgroundColor": self.Sudoku.CompletedColor }, { "duration": "slow" });
                }
            }
        }
    },
    addUserNoteToSpot(id) {
        var self = this;
        var spotClicked = PuzzleMods.getSpotById(self.Sudoku, id);
        var noteAlreadyAdded = false;
        if (!spotClicked.IsUsedAtBeginning && !spotClicked.IsCompleted) {
            for (let i = 0; i < 4; i++) {
                if (spotClicked.UserNotes[i] == self.Sudoku.CurrentValue) {
                    noteAlreadyAdded = true;
                }
            }
            if (!noteAlreadyAdded && spotClicked.UserNotes.length != 4) {
                spotClicked.UserNotes.push(self.Sudoku.CurrentValue);
                self.Sudoku.Array[spotClicked.Row][spotClicked.Column] = spotClicked;

                var beginDiv = '<div class="userNote" ';
                var idString = 'id = "' + spotClicked.Id + 'userNoteFor' + self.Sudoku.CurrentValue + '"';
                var endDiv = '></div>';

                if (self.Sudoku.ColorMode) {
                    var color = PuzzleMods.getColor(self.Sudoku, self.Sudoku.CurrentValue);
                    $("#" + spotClicked.Id).append(beginDiv + idString + endDiv);
                    $("#" + spotClicked.Id + 'userNoteFor' + userValue).css({ "background-color": color, "transition": "background-color 500ms" });
                }
                else {
                    $("#" + spotClicked.Id).append(beginDiv + idString + endDiv);
                    $("#" + spotClicked.Id + 'userNoteFor' + self.Sudoku.CurrentValue).html(self.Sudoku.CurrentValue).css("color", "blue");
                }
                $(".userNote").show();
            }
            else {
                self.shakePuzzle();
            }
        }
        else {
            self.shakePuzzle();
        }
    },
    showNotes(i, spot) {
        var self = this;
        var userValue = spot.UserNotes[i];

        var beginDiv = '<div class="userNote" ';
        var idString = 'id = "' + spot.Id + 'userNoteFor' + userValue + '"';
        var endDiv = '></div>';

        if (self.Sudoku.ColorMode) {
            var color = PuzzleMods.getColor(self.Sudoku, userValue);
            $("#" + spot.Id).append(beginDiv + idString + endDiv);
            $("#" + spot.Id + 'userNoteFor' + userValue).css({ "background-color": color, "transition": "background-color 500ms" });
        }
        else {
            $("#" + spot.Id).append(beginDiv + idString + endDiv);
            $("#" + spot.Id + 'userNoteFor' + userValue).html(userValue).css("color", "blue");
        }
    },
    displayUserInputSudokuForEasyMode: function (id) {
        var self = this;
        if (self.Sudoku.ColorMode) {
            var color = PuzzleMods.getColor(self.Sudoku, self.Sudoku.CurrentValue);
            $("#" + id).animate({ backgroundColor: color }, { duration: "slow" });
            $("#" + id).css({ "border-radius": "50px", "transition": "border-radius 500ms" });
        }
        else {
            var spot = PuzzleMods.getSpotById(self.Sudoku, id);
            $("#" + id).html(spot.Value);
            $("#" + id).animate({ "backgroundColor": self.Sudoku.HighlightColor }, { "duration": "slow" });
        }
    },
    showHint: function (spotToShow) {
        var self = this;
        if (self.Sudoku.ColorMode) {
            var color = PuzzleMods.getColor(self.Sudoku, spotToShow.Value);
            $("#" + spotToShow.Id).css("background-color", color);
            $("#" + spotToShow.Id).html('<i class="material-icons">stars</i>');
            if (self.Sudoku.CurrentValue == spotToShow.Value) {
                $("#" + spotToShow.Id).css({ "border-radius": "50px", "transition": "border-radius 500ms" });
            }
        }
        else {
            $("#" + spotToShow.Id).css("color", "green");
            $("#" + spotToShow.Id).html(spotToShow.Value);
            if (self.Sudoku.CurrentValue == spotToShow.Value) {
                $("#" + spotToShow.Id).animate({ "backgroundColor": self.Sudoku.HighlightColor }, { "duration": "slow" });
            }
        }
        if (self.Sudoku.Hints == 2) {
            $("#hint").html("hint??");
        }
        else if (self.Sudoku.Hints == 1) {
            $("#hint").html("hint?");
        }
        else {
            $("#hint").html("//");
        }
    },
    displayFinishedPuzzleModal: function () {
        var self = this;
        $(".helpText").show();
        $("#puzzleFinishedModal").show();
        if (!self.Sudoku.HardMode) {
            $("#finishedPuzzleText").html('Great job! You clicked on ' + self.Sudoku.BoxesClicked + " boxes; Only " + self.Sudoku.IncorrectInput + " of them were wrong.");
        }
        else {
            $("#finishedPuzzleText").html('Great job! You finished the puzzle!');
        }
    },
    hideLoadModal: function () {
        $("#loadModal").hide();
    },
    displayPuzzle: function () {
        var self = this;
        if (self.Sudoku.ColorMode) {
            self.populateSpotsForColorMode();
        }
        else {
            self.populateSpotsForNumberMode();
        }

    },
    showSavingPuzzleButton: function () {
        $("#savePuzzle").hide();
        $("#savingPuzzle").show();
    },
    showPuzzleSaved: function () {
        $("#puzzleSaved").show();
        $("#savingPuzzle").hide();
        var puzzleSaved = setTimeout(hidePuzzleSaved, 4000);
    },
    hidePuzzleSaved: function () {
        $("#puzzleSaved").hide();
        $("#savePuzzle").show();
    }
}