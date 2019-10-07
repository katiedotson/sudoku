//PUZZLE FUNCTIONS //functions that change the puzzle
//GET COLOR 

var PuzzleMods = {
    getColor: function (sudoku, value) {
        var color;
        for (let each = 0; each < 9; each++) {
            var val = sudoku.ColorArray[each];
            if (val.Value == value) {
                color = val.Color;
            }
        }
        return color;
    },
    //PICK RANDOM STARTING NUMBERS: pick random starting numbers depending on the number user wants to see
    pickRandomStartingNumbers: function (sudoku, numberToAdd) {
        var self = this;
        var numberAdded = 0;
        while (numberAdded < numberToAdd) {
            var randomRow = self.getRandomInt(0, 8);
            var randomColumn = self.getRandomInt(0, 8);
            while (sudoku.Array[randomRow][randomColumn].UserInput != null) {
                randomRow = self.getRandomInt(0, 8);
                randomColumn = self.getRandomInt(0, 8);
            }

            sudoku.Array[randomRow][randomColumn].IsUsedAtBeginning = true;
            sudoku.Array[randomRow][randomColumn].UserInput = sudoku.Array[randomRow][randomColumn].Value;
            sudoku.Array[randomRow][randomColumn].IsCompleted = true;

            numberAdded++;
        }
        sudoku.NumberShown = sudoku.NumberShown + numberAdded;
        sudoku.NumberCompleted = sudoku.NumberShown;
        return sudoku;
    },
    removeStartingNumbers: function (sudoku, numberToRemove) {
        var self = this;
        var numberRemoved = 0;
        while (numberRemoved < numberToRemove) {
            var randomRow = self.getRandomInt(0, 8);
            var randomColumn = self.getRandomInt(0, 8);
            while (!sudoku.Array[randomRow][randomColumn].IsUsedAtBeginning) {
                randomRow = self.getRandomInt(0, 8);
                randomColumn = self.getRandomInt(0, 8);
            }
            sudoku.Array[randomRow][randomColumn].IsUsedAtBeginning = false;
            sudoku.Array[randomRow][randomColumn].IsCompleted = false;
            sudoku.Array[randomRow][randomColumn].UserInput = null;

            numberRemoved++;
        }
        sudoku.NumberShown = sudoku.NumberShown - numberRemoved;
        sudoku.NumberCompleted = sudoku.NumberShown;
        return sudoku;
    },
    decideWhetherToShowValueInSpot: function (sudoku, id) {
        var self = this;
        var spot = self.getSpotById(sudoku, id);
        var decision = false;
        if (sudoku.CurrentValue == spot.Value && !spot.IsCompleted) {
            decision = true;
        }
        return decision;
    },
    addUserInputToSudokuArray: function (sudoku, id) {
        var self = this;
        var spot = self.getSpotById(sudoku, id);
        spot.UserInput = sudoku.CurrentValue;
        spot.IsCompleted = true;

        //return spot to sudoku array
        sudoku.Array[spot.Row][spot.Column] = spot;
        return sudoku;
    },
    getSpotById: function (sudoku, id) {
        var spot;
        for (let row = 0; row < 9; row++) {
            for (let column = 0; column < 9; column++) {
                if (sudoku.Array[row][column].Id == id) {
                    spot = sudoku.Array[row][column];
                    return spot;
                }
            }
        }

    },
    setCurrentValue: function (sudoku, idOfSelectedValue) {
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
    },
    checkIfValueCompleted: function (sudoku, value) {
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
    },
    giveAHint: function (sudoku) {
        var self = this;
        var randomRow = self.getRandomInt(0, 8);
        var randomColumn = self.getRandomInt(0, 8);
        var spot = sudoku.Array[randomRow][randomColumn];
        while (spot.UserInput == spot.Value) {
            randomRow = self.getRandomInt(0, 8);
            randomColumn = self.getRandomInt(0, 8);
            var spot = sudoku.Array[randomRow][randomColumn];
        }
        sudoku.NumberShown++;
        sudoku.NumberToShow++;
        sudoku.Hints--;
        sudoku.NumberCompleted++;

        var spotToShow = sudoku.Array[randomRow][randomColumn];
        spotToShow.IsCompleted = true;
        spotToShow.UserInput = spotToShow.Value;
        spotToShow.UserNotes = [];
        spotToShow.WasHinted = true;

        sudoku.Array[spotToShow.Row][spotToShow.Column] = spotToShow;

        return sudoku;
    },
    getRandomInt: function (min, max) {
        max += 1;
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}
