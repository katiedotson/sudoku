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