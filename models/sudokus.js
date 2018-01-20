var Sudoku = createSudoku();
module.exports = Sudoku;

//Sudoku object init
function getSudokuObject(){
    var SudokuObject = {
        "DidntWork": true, 
        "Array": [], 
        "NumberToShow": 17, 
        "NumberShown": 0, 
        "IncorrectInput": 0,
        "BoxesClicked": 0, 
        "HighlightColor": "#d3e4ff", 
        "CompletedColor": "#6bffa5", 
        "NotesMode": false, 
        "OopsMode": false,
        "IdOfCurrentValue": "0", 
        "Playing": false, 
        "ColorMode": false, 
        "HardMode": false, 
        "CurrentValue": null, 
        "Hints": 3,
        "ColorArray":
            [{ "Value": 1, "Color": "#f75df2" },
            { "Value": 2, "Color": "#f42318" },
            { "Value": 3, "Color": "#ffae00" },
            { "Value": 4, "Color": "#f0f418" },
            { "Value": 5, "Color": "#91e871" },
            { "Value": 6, "Color": "#71e8a6" },
            { "Value": 7, "Color": "#71e4e8" },
            { "Value": 8, "Color": "#3cace0" },
            { "Value": 9, "Color": "#a54df2" }]
    };

    return SudokuObject;
}

//create Sudoku object; populate its Array with numbers randomly while ensuring no numbers repeat
function createSudokuArray() {
    var Sudoku = getSudokuObject();
    Sudoku.Array = createEmptySudokuArray();
    var didNotWork = false;
    var boxArray = getBoxArray();
    var rowArray = getBoolArray();
    var columnArray = getBoolArray();
    var spotArray = getBoolArray();

    for (positionInBox0 = 0; positionInBox0 < 9; positionInBox0++) {

        //get a random number, check if it has been used (boxArray[position of this value in the array] returns a bool)
        var value = getRandomInt(0, 8);
        while (boxArray[value]) {
            value = getRandomInt(0, 8);
        }

        //Sudoku.Array is populated with the number
        var box0ColumnAndRow = getBox0ColumnAndRow(positionInBox0);
        var box0Row = box0ColumnAndRow[0];
        var box0Column = box0ColumnAndRow[1];
        var box0Id = getId(box0Row, box0Column);
        var sudokuValue = value + 1;
        //place that value in the spot array
        Sudoku.Array[box0Row][box0Column] = getSpotObject(box0Row, box0Column, false, sudokuValue, box0Id);

        //say that the number has been used in the box, row and column
        boxArray[value] = true;
        rowArray[box0Row][value] = true;
        columnArray[box0Column][value] = true;


        //for each box, place the number
        for (box = 1; box < 9; box++) {

            //returns valid columns and rows depending on what box we're in
            //REFACTOR THIS AS AN OBJECT!!!!
            var columns = [];
            columns = getColumns(box);
            var rows = [];
            rows = getRows(box);

            var minRow = rows[0];
            var maxRow = rows[1];
            var minColumn = columns[0];
            var maxColumn = columns[1];

            //generates a random number for each
            var randomRow = getRandomInt(minRow, maxRow);
            var randomColumn = getRandomInt(minColumn, maxColumn);

            //see if that spot will work
            var checkingIfThisWorks = true;
            while (checkingIfThisWorks) {

                //check if that spot has been used and if the number has already been used in that row and column
                if (spotArray[randomRow][randomColumn] || rowArray[randomRow][value] || columnArray[randomColumn][value]) {
                    var counter = 0;
                    //if it has, get a new spot
                    while (spotArray[randomRow][randomColumn] || rowArray[randomRow][value] || columnArray[randomColumn][value]) {
                        counter++;
                        if (counter == 20000) {
                            //it didn't work, break out of for loop and return "DidNotWork = true" to the caller
                            didNotWork = true; { break; }
                        }
                        randomRow = getRandomInt(minRow, maxRow);
                        randomColumn = getRandomInt(minColumn, maxColumn);
                    }
                }

                checkingIfThisWorks = false;

            }
            if (didNotWork) {
                break;
            }
            var spot = getSpotObject();

            //Sudoku.Array[][] = value
            var id = getId(randomRow, randomColumn);
            Sudoku.Array[randomRow][randomColumn] = getSpotObject(randomRow, randomColumn, false, sudokuValue, id);

            //say that it has been used
            rowArray[randomRow][value] = true;
            columnArray[randomColumn][value] = true;
            spotArray[randomRow][randomColumn] = true;
        }
    }
    if (didNotWork) {
        Sudoku.DidntWork = true;
    }
    else {
        Sudoku.DidntWork = false;
    }
    return Sudoku;
}

function getBoxArray() {
    var boxArray = [];
    for (x = 0; x < 9; x++) {
        boxArray[x] = false;
    }
    return boxArray;
}

function getBoolArray() {
    var boolArray = [];
    for (p = 0; p < 9; p++) {
        boolArray[p] = [];
        for (h = 0; h < 9; h++) {
            boolArray[p][h] = false;
        }
    }
    return boolArray;
}

function getRandomInt(min, max) {
    max += 1;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRows(box) {
    var rows = [];
    if (box < 3) {
        rows[0] = 0;
        rows[1] = 2;
    }
    else if (box < 6) {
        rows[0] = 3;
        rows[1] = 5;
    }
    else {
        rows[0] = 6;
        rows[1] = 8;
    }
    return rows;
}

function getColumns(box) {
    var columns = [];

    if (box == 3 || box == 6) {
        columns[0] = 0;
        columns[1] = 2;
    }
    else if (box == 1 || box == 4 || box == 7) {
        columns[0] = 3;
        columns[1] = 5;
    }
    else {
        columns[0] = 6;
        columns[1] = 8;
    }
    return columns;
}

function getBox0ColumnAndRow(g) {
    var box0Row;
    var box0Column;
    if (g == 0) {
        box0Row = 0;
        box0Column = 0;
    }
    else if (g == 1) {
        box0Row = 0;
        box0Column = 1;
    }
    else if (g == 2) {
        box0Row = 0;
        box0Column = 2;
    }
    else if (g == 3) {
        box0Row = 1;
        box0Column = 0;
    }
    else if (g == 4) {
        box0Row = 1;
        box0Column = 1;
    }
    else if (g == 5) {
        box0Row = 1;
        box0Column = 2;
    }
    else if (g == 6) {
        box0Row = 2;
        box0Column = 0;
    }
    else if (g == 7) {
        box0Row = 2;
        box0Column = 1;
    }
    else {
        box0Row = 2;
        box0Column = 2;
    }
    var box0ColumnAndRow = [box0Row, box0Column];
    return box0ColumnAndRow;
}

function getSpotObject(row, column, isUsed, value, id, userInput, isCompleted) {
    var spot = {
        "IsUsedAtBeginning": isUsed,
        "Row": row,
        "Column": column,
        "Value": value,
        "Id": id,
        "UserInput": null,
        "IsCompleted": false,
        "UserNotes": []
    };
    return spot;
}

function createEmptySudokuArray() {

    var array = [];
    for (d = 0; d < 9; d++) {
        array[d] = [];
        for (q = 0; q < 9; q++) {
            array[d][q] = {};
        }
    }
    return array;
}

function getId(row, column) {
    var firstRowValue = column + 1;
    var id = firstRowValue + row * 9;
    return id;
}

function createSudoku() {
    var newSudoku = createSudokuArray();
    while (newSudoku.DidntWork) {
        newSudoku = createSudokuArray();
    }
    return newSudoku;
}