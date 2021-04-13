"use strict"

/*
Cheat sheet for those unfamiliar with chess
(because I made some of this less verbose than it could/should be):

p = pawn
r = rook (castle)
n = knight
b = bishop
q = queen
k = king

w = white
b = black

This shorthand is used a couple places that I can't be bothered to change,
so I just used it everywhere so I don't have to convert it back and forth.
*/


// Create a representation of the board
let board = new Array();

/*
This class takes variuos characteristics and turns them into an "object".
We can use this to create an object for each piece, but with a lot of shared characteristics to avoid repetition.
The widespread use of objects led to something called "object-oriented programming" and it was a thing or something.
*/
class chessPiece {
    constructor(x, y, type, color) {
        this.position = {x, y};
        this.type = type;
        this.color = color;
    }
}

// This function resets the board.
function resetBoard() {
    // Set the board to be empty (really only neccesary if there's anything already in it; i.e., not the first time)
    board = []
    // Create 8 rows of 8 (empty) items each
    for (let i = 0; i < 8; i++) {
        board[i] = new Array(8);
    }

    // Set up the initial position of the board (TODO)
}

// Actually use the function above to reset the board
resetBoard();

// This is probably a super inefficient way to do this
function synchronizeBoardState() {
    // TODO
}