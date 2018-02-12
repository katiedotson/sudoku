//PUZZLE FUNCTIONS //functions that change the puzzle
//GET COLOR 
function getColor(sudoku, value) {
    var color;
    for (let each = 0; each < 9; each++) {
        var val = sudoku.ColorArray[each];
        if (val.Value == value) {
            color = val.Color;
        }
    }
    return color;
}
//PICK RANDOM STARTING NUMBERS: pick random starting numbers depending on the number user wants to see
function pickRandomStartingNumbers(sudoku, numberToAdd) {
    var numberAdded = 0;
    while (numberAdded < numberToAdd) {
        var randomRow = getRandomInt(0, 8);
        var randomColumn = getRandomInt(0, 8);
        while (sudoku.Array[randomRow][randomColumn].IsUsedAtBeginning) {
            randomRow = getRandomInt(0, 8);
            randomColumn = getRandomInt(0, 8);
        }

        sudoku.Array[randomRow][randomColumn].IsUsedAtBeginning = true;

        sudoku.Array[randomRow][randomColumn].UserInput = sudoku.Array[randomRow][randomColumn].Value;
        sudoku.Array[randomRow][randomColumn].IsCompleted = true;

        numberAdded++;
    }
    sudoku.NumberShown = sudoku.NumberShown + numberAdded;
    sudoku.NumberCompleted = sudoku.NumberShown;
    return sudoku;
}
//REMOVE STARTING NUMBERS : remove numbers according to the number the user wants to remove 
function removeStartingNumbers(sudoku, numberToRemove) {
    var numberRemoved = 0;
    while (numberRemoved < numberToRemove) {
        var randomRow = getRandomInt(0, 8);
        var randomColumn = getRandomInt(0, 8);
        while (!sudoku.Array[randomRow][randomColumn].IsUsedAtBeginning) {
            randomRow = getRandomInt(0, 8);
            randomColumn = getRandomInt(0, 8);
        }
        sudoku.Array[randomRow][randomColumn].IsUsedAtBeginning = false;
        sudoku.Array[randomRow][randomColumn].IsCompleted = false;
        sudoku.Array[randomRow][randomColumn].UserInput = null;

        numberRemoved++;
    }
    sudoku.NumberShown = sudoku.NumberShown - numberRemoved;
    sudoku.NumberCompleted = sudoku.NumberShown;
    return sudoku;
}
//DECIDE WHETHER TO ADD VALUE : based on mode and whether the spot is completed. includes ADD USER INPUT
function decideWhetherToShowValueInSpot(sudoku, id) {
    var spot = getSpotById(sudoku, id);
    var decision = false;
    if (sudoku.CurrentValue == spot.Value && !spot.IsCompleted) {
        decision = true;
    }
    return decision;
}
//ADD USER INPUT TO SUDOKU ARRAY : adds value to spot, says it is completed 
function addUserInputToSudokuArray(sudoku, id) {
    var spot = getSpotById(sudoku, id);
    spot.IsUsedAtBeginning = true;
    spot.UserInput = sudoku.CurrentValue;
    spot.IsCompleted = true;

    //return spot to sudoku array
    sudoku.Array[spot.Row][spot.Column] = spot;
    return sudoku;
}
//GET SPOT BY ID : gets the the spot object the user clicked based on its id
function getSpotById(sudoku, id) {
    var spot;
    for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
            if (sudoku.Array[row][column].Id == id) {
                spot = sudoku.Array[row][column];
            }
        }
    }
    return spot;
}
//SET CURRENT VALUE : set global variable currentValue based on the id of the div the user clicked
function setCurrentValue(sudoku, idOfSelectedValue) {
    if (idOfSelectedValue == "value1") {
        sudoku.CurrentValue = 1;
    }
    else if (idOfSelectedValue == "value2") {
        sudoku.CurrentValue = 2;
    }
    else if (idOfSelectedValue == "value3") {
        sudoku.CurrentValue = 3;
    }
    else if (idOfSelectedValue == "value4") {
        sudoku.CurrentValue = 4;
    }
    else if (idOfSelectedValue == "value5") {
        sudoku.CurrentValue = 5;
    }
    else if (idOfSelectedValue == "value6") {
        sudoku.CurrentValue = 6;
    }
    else if (idOfSelectedValue == "value7") {
        sudoku.CurrentValue = 7;
    }
    else if (idOfSelectedValue == "value8") {
        sudoku.CurrentValue = 8;
    }
    else if (idOfSelectedValue == "value9") {
        sudoku.CurrentValue = 9;
    }
    else {
        sudoku.CurrentValue = null;
    }
    //change the id of currentValue to selected value
    sudoku.IdOfCurrentValue = idOfSelectedValue;
    return sudoku;
}
//CHECK IF VALUE COMPLETED : returns bool based on the value passed to it, true if all numbers are complete (shown in puzzle)
function checkIfValueCompleted(sudoku, value) {
    var numberCompleted = 0;
    var completed = false;
    for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
            var spot = sudoku.Array[row][column];
            if (spot.IsCompleted && spot.Value == value) {
                numberCompleted++;
            }
        }
    }
    if (numberCompleted == 9) {
        completed = true;
    }
    return completed;
}
//GIVE A HINT
function giveAHint(sudoku) {
    if (sudoku.Hints > 0) {
        var randomRow = getRandomInt(0, 8);
        var randomColumn = getRandomInt(0, 8);
        var spot = sudoku.Array[randomRow][randomColumn];
        while (spot.IsUsedAtBeginning || spot.UserInput == spot.Value) {
            randomRow = getRandomInt(0, 8);
            randomColumn = getRandomInt(0, 8);
            var spot = sudoku.Array[randomRow][randomColumn];
        }
        sudoku.NumberShown++;
        sudoku.NumberToShow++;
        sudoku.Hints--;
        sudoku.NumberCompleted++;
        if(sudoku.NumberCompleted == 81){
            return finishPuzzleForHardMode(sudoku);
        }

        var spotToShow = sudoku.Array[randomRow][randomColumn];
        spotToShow.IsCompleted = true;
        spotToShow.UserInput = spotToShow.Value;
        spotToShow.UserNotes = [];

        sudoku.Array[spotToShow.Row][spotToShow.Column] = spotToShow;

        showHint(sudoku, spotToShow);
    }
    else{
        shakePuzzle();
    }
    return sudoku;
}
function getRandomInt(min, max) {
    max += 1;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}